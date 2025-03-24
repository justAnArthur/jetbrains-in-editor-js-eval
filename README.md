# In editor JS evaluation | Jetbrains Internship 25

## Task 02

> ...that will efficiently perform the specified operations...

I developed a solution to execute only the specific code necessary for obtaining a particular result, significantly
enhancing efficiency. For example, if we simply require the result of `a + b`, there's no need to evaluate the entire
script. Using JavaScript AST parsing via the acorn library, my approach analyzes the user's input—either specific line
numbers or custom selections—intelligently identifying and extracting only the essential variables, functions, and
dependencies. These relevant elements are then combined and executed, ensuring a targeted and efficient code evaluation
process.

... After some testing i am getting that passing the plain whole fail to `node:vm` and evaluating it with some new input
is faster, more than in 10 times ... I am slightly confused ) With commented `console.log` the difference decreased but
still is 4x. Of course, I can suppose that parsing each line is  .... Or not. In more complex cases, the difference is another.

## Task 01

### Background

- I have written more than 100,000 lines of JavaScript and TypeScript, working extensively with frameworks and libraries
  such as Next.js, React.js, Node.js, and Bun.js.
- Experience creating multiple production websites using this tech stack.
- I have also developed custom libraries and plugins. For example, my most recent project allowed our team to build
  forms with complex validations entirely from extended Yup.js schemas typed with Java classes.

### Thoughts

Debugging can be one of the most challenging parts of development. While tools like JetBrains provide powerful
debuggers, thanks for that, an interactive coding environment with real-time feedback would make troubleshooting much
faster and more intuitive. By seeing immediate results, developers could identify errors quickly and iterate on
solutions more effectively.

This will reduce the time spent context-switching between writing code, compiling, and checking logs or error messages.
Ultimately, it leads to a more efficient, iterative workflow that boosts productivity and code quality.
