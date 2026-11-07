// The dicta capability module of Teamboard (sites/example-site/notes.md).
// It calls the site's own functions, the ones its buttons call.

import { type CapabilityModule, dictaCapabilities } from "dicta-action-js";
import * as actions from "teamboard/actions.ts";
import { getTask, listTasks, listTeammates, type Task } from "teamboard/api.ts";

type IdArgs = { id: string };
type ListArgs = { search?: string; limit?: number };
type CreateArgs = { title: string; due?: string; assignee?: string };
type ChangeArgs = {
  id: string;
  title?: string;
  due?: string | null;
  assignee?: string | null;
};
type DoneArgs = { id: string; done: boolean };
type ShareArgs = { id: string; teammate: string };

const taskId = { type: "string", description: "The task's id" };

const taskOutput = {
  type: "object",
  properties: {
    id: { type: "string" },
    title: { type: "string" },
    due: { type: ["string", "null"], description: "Date, YYYY-MM-DD" },
    done: { type: "boolean" },
    assignee: {
      type: ["object", "null"],
      properties: { id: { type: "string" }, name: { type: "string" } },
    },
  },
};

// The teammate's name, for outputs and confirmations.
async function teammateName(id: string) {
  const teammate = (await listTeammates()).find((t) => t.id === id);
  return teammate ? teammate.name : id;
}

async function taskTitle(id: string) {
  return (await getTask(id)).title;
}

// A task as the planner needs it: the assignee with its name.
async function withNames(tasks: Task[]) {
  const teammates = await listTeammates();
  return tasks.map((task) => {
    const person = teammates.find((t) => t.id === task.assignee);
    return {
      id: task.id,
      title: task.title,
      due: task.due,
      done: task.done,
      assignee: person ? { id: person.id, name: person.name } : null,
    };
  });
}

const teamboard: CapabilityModule = {
  site: {
    name: "Teamboard",
    desc:
      "A task list for a team. A task has a title, an optional due date, " +
      "a done mark and an optional assignee, one of the teammates.",
  },
  state: {
    desc:
      'The open page: "list", the list of all tasks, or "task", one task ' +
      "with its id.",
    run: async () => {
      const match = /^\/tasks\/([^/]+)$/.exec(location.pathname);
      return match?.[1]
        ? { page: "task", id: decodeURIComponent(match[1]) }
        : { page: "list" };
    },
  },
  capabilities: {
    ...dictaCapabilities,

    "teammates.list": {
      level: "read",
      desc: "Lists the teammates, the people a task can be assigned to or shared with.",
      output: {
        type: "array",
        items: {
          type: "object",
          properties: { id: { type: "string" }, name: { type: "string" } },
        },
      },
      run: async () =>
        (await listTeammates()).map((t) => ({ id: t.id, name: t.name })),
    },

    "tasks.list": {
      level: "read",
      desc:
        "Lists tasks, oldest first, at most 50. Filters by a search text in " +
        "the title. total is the number of matching tasks, also those not returned.",
      args: {
        type: "object",
        properties: {
          search: { type: "string", description: "Text in the title" },
          limit: { type: "number", description: "At most 50, 20 by default" },
        },
      },
      output: {
        type: "object",
        properties: {
          total: { type: "number" },
          tasks: { type: "array", items: taskOutput },
        },
      },
      run: async ({ search, limit }: ListArgs) => {
        const all = await listTasks(search ?? "");
        const count = Math.max(1, Math.min(50, Math.floor(limit ?? 20)));
        return { total: all.length, tasks: await withNames(all.slice(0, count)) };
      },
    },

    "tasks.get": {
      level: "read",
      desc: "Returns one task.",
      args: { type: "object", properties: { id: taskId }, required: ["id"] },
      output: taskOutput,
      run: async ({ id }: IdArgs) => (await withNames([await getTask(id)]))[0],
    },

    "tasks.create": {
      level: "write",
      desc: "Adds a task, with an optional due date and assignee.",
      args: {
        type: "object",
        properties: {
          title: { type: "string", description: "1 to 200 characters" },
          due: { type: "string", description: "Date, YYYY-MM-DD" },
          assignee: { type: "string", description: "A teammate's id" },
        },
        required: ["title"],
      },
      output: {
        type: "object",
        properties: { id: { type: "string" }, title: { type: "string" } },
      },
      confirm: async ({ title, due, assignee }: CreateArgs) => {
        let text = `Add task "${title}"`;
        if (due !== undefined) text += `, due ${due}`;
        if (assignee !== undefined) text += `, for ${await teammateName(assignee)}`;
        return text;
      },
      run: async ({ title, due, assignee }: CreateArgs) => {
        const task = await actions.addTask(title, due ?? null, assignee ?? null);
        return { id: task.id, title: task.title };
      },
    },

    "tasks.change": {
      level: "write",
      desc:
        "Changes a task's title, due date or assignee, or removes its due " +
        "date or assignee.",
      args: {
        type: "object",
        properties: {
          id: taskId,
          title: { type: "string", description: "1 to 200 characters" },
          due: {
            type: ["string", "null"],
            description: "Date, YYYY-MM-DD, or null to remove it",
          },
          assignee: {
            type: ["string", "null"],
            description: "A teammate's id, or null for nobody",
          },
        },
        required: ["id"],
      },
      confirm: async ({ id, title, due, assignee }: ChangeArgs) => {
        const changes = [];
        if (title !== undefined) changes.push(`title "${title}"`);
        if (due !== undefined) {
          changes.push(due === null ? "no due date" : `due ${due}`);
        }
        if (assignee !== undefined) {
          changes.push(
            assignee === null
              ? "nobody assigned"
              : `assigned to ${await teammateName(assignee)}`,
          );
        }
        return `Change "${await taskTitle(id)}": ${changes.join(", ")}`;
      },
      // Passes on only the fields the plan gave.
      run: async ({ id, ...changes }: ChangeArgs) => {
        await actions.updateTask(id, changes);
      },
    },

    "tasks.setDone": {
      level: "write",
      desc: "Marks a task done, or not done.",
      args: {
        type: "object",
        properties: { id: taskId, done: { type: "boolean" } },
        required: ["id", "done"],
      },
      confirm: async ({ id, done }: DoneArgs) =>
        `Mark "${await taskTitle(id)}" ${done ? "done" : "not done"}`,
      run: async ({ id, done }: DoneArgs) => {
        await actions.setDone(id, done);
      },
    },

    "tasks.delete": {
      level: "destructive",
      desc: "Deletes a task. It cannot be restored.",
      args: { type: "object", properties: { id: taskId }, required: ["id"] },
      confirm: async ({ id }: IdArgs) => `Delete "${await taskTitle(id)}"`,
      run: async ({ id }: IdArgs) => {
        await actions.deleteTask(id);
      },
    },

    "tasks.share": {
      level: "external",
      desc: "Shares a task with a teammate. The teammate gets an email.",
      args: {
        type: "object",
        properties: {
          id: taskId,
          teammate: { type: "string", description: "A teammate's id" },
        },
        required: ["id", "teammate"],
      },
      // Shows the email address the site sends the task to.
      confirm: async ({ id, teammate }: ShareArgs) => {
        const person = (await listTeammates()).find((t) => t.id === teammate);
        if (!person) {
          throw Object.assign(new Error("No such teammate"), { code: "not_found" });
        }
        return `Share "${await taskTitle(id)}" with ${person.name} (${person.email})`;
      },
      run: async ({ id, teammate }: ShareArgs) => {
        await actions.shareTask(id, teammate);
      },
    },

    "tasks.open": {
      level: "write",
      desc: "Opens a task's page. Loads a page; the steps after it do not run.",
      pageLoad: true,
      args: { type: "object", properties: { id: taskId }, required: ["id"] },
      confirm: async ({ id }: IdArgs) => `Open "${await taskTitle(id)}"`,
      run: async ({ id }: IdArgs) => {
        actions.openTask(id);
      },
    },
  },
};

export default teamboard;
