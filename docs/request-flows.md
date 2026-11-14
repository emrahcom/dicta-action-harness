# Request flows

A way to make your module better step by step. It is a recommendation, not a
rule. Use it as it fits your site.

## The idea

Write down what your users do on your site as flows. A flow is one use case: a
few requests in plain words, in the order a user makes them. Later requests can
refer to earlier ones, such as "make it bigger" or "undo that". Each request has
the result the user expects.

Then work in a loop:

1. Run the flows on your running site.
2. Look at what went wrong.
3. Fix the module.
4. Run the flows again.

Stop when all of them work.

## Tips

- Write the requests the way your users talk. They name things by what they see,
  such as "the blue box" or "the table on the left", not by an id.
- Let each flow start from a clean state and make what it needs. Then each flow
  can run alone.
- The planner does not answer the same way each time. So judge each result:
  passed, failed or not clear. Do not compare it word for word.
- Try a fix before you deploy it, if you can. The loop is then much shorter.
- Keep the flows and their results with the site, so the next session can run
  them again.
- Each run calls the planner, and that costs money. Run the flows when you
  change the module, not all the time.
