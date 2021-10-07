# Archivist structure
Archivist has 3 levels of structure, they are archivist itself, pipelines, and modules.

## Archivist
This is what you start as the last line of your config file by calling: 
```ts
archivist.run(config);
```
This level is responsible for project wide configurations and calling the pipelines.
When starting it does the following:
1. It runs the preprocessor pipelines in parallel.
2. It runs the main pipelines in parallel.

If any of the preprocess pipelines have an error the whole run is canceled.

## Pipelines
A pipeline is composed of Modules that are executed one by one.
They represent a single conversion from the source files to the output files.
Multiple pipelines can process the same files and produce different outputs in a single run
(generate a blog website and an RSS feed file as well)  

When a pipeline is run the following happens:
1. It runs the module's setup function in parallel.
2. Next it runs each module in sync.

> If any of the steps (setup or module execution) produces an error it stops the pipeline.

The Modules are run one by one to ensure the new module has the most up-to-date information on every file.
This can be important for generating list pages (for blogs or similar sites).

### Modules
Modules are what actually transform the documents.
They are responsible for reading in modifying and writing the content to the output
Every module must extend from ``IModule`` but it is highly suggested extending from ``SimpleModule``.

#### SimpleModule
SimpleModule has quite a few of the boilerplate already set up for ease of use.
 - A function to process a single document and not all of them
 - Helper functions for a few paths that are frequently used

A module has 2 main methods:
 - ``setup(pipeline:Pipeline, parent?:IModule): Promise<any>``
In this methode one should set up the module. It is recommended to cache any files
that will be used during the processing of the files.
**The parameters:** 
    - ``pipeline`` the pipeline this is inside.
    - ``parent`` If this is a module inside a composite module this will be the parent module.
 - ``process(docs:Array<Content>): Promise<any>`` 
This is responsible for processing all the documents that the last module in the pipeline produced.
If this is the first module it will receive an empty array. It can modify the array and elements in any way.
in most cases one will want to modify the ``contnet`` and ``metadata`` of the documents. 
But the module cna remove or even add new elements to the array.
