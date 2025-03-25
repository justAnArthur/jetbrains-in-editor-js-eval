# In editor JS evaluation | Jetbrains Internship 25

## Task 02

> ...that will efficiently perform the specified operations...

I developed a solution to execute only the specific code necessary for obtaining a particular result, significantly
enhancing efficiency. For example, if we simply require the result of `a + b`, there's no need to evaluate the entire
script. Using JavaScript AST parsing via the acorn library, my approach analyzes the user's input—either specific line
numbers or custom selections—intelligently identifying and extracting only the essential variables, functions, and
dependencies. These relevant elements are then combined and executed, ensuring a targeted and efficient code evaluation
process.

The current implementation is a proof of concept, and in general simple cases the performance (time and memory) of
result with only code that is required to run is worse than evaluating the whole script. But in more complex cases, the
performance is better. And with improvements, it can be better in all cases.

### Run

```bash
node -v # v23.0.0
node .js --experimental-vm-modules # !!! add experimental-modules flag
```

## Task 01

### Background

- I have written more than 100,000 lines of JavaScript and TypeScript, working extensively with frameworks and libraries
  such as Next.js, React.js, Node.js, and Bun.js. And also I have solid experience with optimizing things to gain
  maximum performance with JavaScript. Even rewriting several things to C and running them with Node.js.
- Experience creating several applications using this tech stack.
- I have also developed custom libraries and plugins. For example, my most recent project allowed our team to build
  forms with complex validations entirely from extended Yup.js schemas typed with Java classes.

### Thoughts

Debugging can be one of the most challenging parts of development. While tools like JetBrains provide powerful
debuggers, thanks for that, an interactive coding environment with real-time feedback would make troubleshooting much
faster and more intuitive. By seeing immediate results, developers could identify errors quickly and iterate on
solutions more effectively.

This will reduce the time spent context-switching between writing code, compiling, and checking logs or error messages.
Ultimately, it leads to a more efficient, iterative workflow that boosts productivity and code quality.
