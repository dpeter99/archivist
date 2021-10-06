# Archivist
|Version | Status |
|---|---|
|0.1.0-alpha01 | active |

Archivist is an un-opinionated static site generator, aimed at general sites and specifications.
It uses the Deno runtime to avoid complex and long installation times.

## Getting started
To get started make a file named ``archivist.config.ts`` (The name is optional currently)
### 1. Step
And start by importing the archivist package:
This can be a direct link or a link to a specific version.
Be aware that if you don't include the version Deno will cache it and will not update it automatically.
```ts
import * as archivist from "https://github.com/dpeter99/archivist/raw/main/src/index.ts";
```
### 2. Step
Next start writing the config for archivist:
```ts
export let config: archivist.Config = {
    
}
```
If your ide has support for Deno it should be able to give type information for you.
The main things to configure are the following:
```ts
export let config: archivist.Config = {
    template: "./theme", 
    outputPath: "./out"
}
```
The template tells Archivist where to find the template files more on this in the [templates](#Templates) section 
The output path is the path where it will place the generated files.
### 3. Step
Next you have to specify the pipelines to be used.
Archivist uses pipelines to create the output. This is one of the simplest pipelines that most projects will evolve from.
```ts
pipelines:[
    archivist.Pipeline.fromModules({name:"example_pipe",contentRoot:"./content/"},
        new archivist.FileReaderModule("./**/*.md"),
        new archivist.MarkdownRender({
            shiftHeadersAmount:0
        }),
        new archivist.TemplateModule(),
        new archivist.OutputModule()
    )
]
```
A pipeline must have a ``name`` and an optional ``contentRoot`` path.
 - ``name`` is for identifying the pipeline in longs.
 - ``contentRoot`` helps with reading files.

The example pipeline has the following modules in it:
 - ``FileReaderModule`` This is a simple module for reading in the files contents that match the given glob.
This is relative to the ``contentRoot`` of the pipeline it is inside.
 - ``MarkdownRender`` Is the module that converts the markdown data to html. 
It currently has limited configuration, but does allow to, set up a custom instance of Markdown-It
 - ``TemplateModule`` This module is responsible for actually using the EJS templates and inserting the previously
produced html version of the md files.
 - ``OutputModule`` This module simply writes the processed documents to the disk in the output folder.

