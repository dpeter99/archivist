# Archivist templates

Archivist can use templates to generate the output files. Currently, the only templating engine is ejs.
The templates are defined by a ``template.json`` file located in the root folder of the template.

## How templating works

Templating in Archivist works by adding the ``TemplateModule`` to your pipeline.
This module uses ejs to generate the output, this output will replace the ``Content.content`` 
(This means that from this point on your can not access the original content).
The template module finds the correct file to use for templating by using the matchers found in the template.json file.
These are evaluated as JS string interpolation and checked if they exist. The first existing file will be used.
The EJS engine gets extra info about the document it is working on.

### More complex cases
It is possible that you want to include a common set of things in your page, like the header and style includes.
For this it is possible to specify a "root template".
If this is specified than only the rot template will be run,
but the template found by the matcher will be provided in a variable named ``template``.
You cna than include this sub template in the root's body for example.

Example of a root template:
```html
<body class="background-3">
    <%- include('layouts/nav.html.ejs')%>
    <div class="content">
        <%-include(template)%>
    </div>
    <%- include("layouts/footer.html.ejs") %>
</body>
```




## ``template.json``
There is a schema available for the file in: ``/src/template.schema.json``.
Important values:
### compiledPath
The path where the files of the template is. This is usually ``"./"``.
But if webpack or similar is in use to build the files for the template (compile scss, ts, etc..),
in this case the ``compiledPath`` should be the output folder of that compilation (eg: ``"compiledPath": "./dist"``)
For more information on running the template's build as part of the process look at ``WebpackModule``.
### ignore
This should be an array of files to be ignored when copying the assets to the output.
This usually contains the following:
```json
"ignore":[
    "*.ejs"
],
```

### rootTemplate
The root template is an important option

### matchers
The ``matchers`` array contains an ordered list of files names. 
This is the order in witch Archivist will look for ejs template files.
You can use JS string interpolation in them to differentiate based on data in the documents.
For example, you can define a different template based on any of the metadata defined in the files.
```json lines
"matchers": [
  "${meta.type}.html.ejs"
],
```
> In this example all documents are templated using a template file that starts with the "type"
> from the metadata of the doc. 

### metadata
The metadata field describes what constrains the template has for the metadata.
For example a template might expect a field to be an array and iterate over it to display it.
```json lines
"metadata":{
  "mustBeArray":[
    "state"
  ]
}
```




## The EJS environment
The ejs env gets the following varaibles:
- ``content`` : the content of the document
- ``meta`` : an array of metadata from the document
- ``StatusCodes`` : A class that helps with decerning the status of the doc (WIP)
- ``ArticleHelper`` : (WIP)
- ``pipeline`` : the full pipeline object running.
