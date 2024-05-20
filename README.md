# Copy Templater

Extension designed to conveniently template code snippets, particularly for Language Learning Model (LLM) input, facilitating quick formatting and copying of delimitted code snippets and contextual information like the file path.

## Features

-   Automatically formats code snippets with markdown to ensure compatibility with platforms requiring formatted input.
-   Includes contextual information like file paths in the copied content, making it easier to reference the source in collaborative environments.
-   Offers customizable templates that can be tailored through VSCode settings to match specific formatting requirements.

## Requirements

No additional requirements or dependencies are needed for this extension beyond the standard VSCode installation.

## Extension Settings

You can customize the functionality of "Copy Templater" through the settings accessed from `File > Preferences > Settings`. Configure templates and other options under the `copy-paste-template` configuration key.

-   `copy-paste-template.template`: Defines the format of the text that is copied to the clipboard. You can customize this template using placeholders for specific pieces of information:
    
    -   `{filePath}`: Inserts the relative path of the file.
    -   `{range}`: Includes the range of the selection, formatted according to the `copy-paste-template.rangeTemplate`.
    -   `{text}`: Inserts the selected text. The default template formats the file path and selection range on separate lines above the selected text, which is enclosed in markdown code blocks.
-   `copy-paste-template.rangeTemplate`: Specifies how to format the range of the selection in the copied text, using placeholders:
    
    -   `{startLine}`: Line number where the selection starts.
    -   `{endLine}`: Line number where the selection ends.
    -   `{startChar}`: Character position where the selection starts.
    -   `{endChar}`: Character position where the selection ends.
    
-   `copy-paste-template.removeRootIndentation`: If enabled, removes any root indentation from the copied selection. This helps in maintaining the original formatting of the code when it is pasted elsewhere. The default is set to `true`.

The default template is set to output a markdown code block prefixed by the file path and range. You could easily change the template to use different formats, e.g. XML.

The default range template outputs the range in the format `:{startLine}:{startChar}-{endLine}:{endChar}`, indicating the start and end points of the selection. You may want to remove the character indices.

## Known Issues

No known issues at this time.

## Release Notes

### 0.0.1

Initial release

## Following extension guidelines

* [Extension Guidelines](https://code.visualstudio.com/api/references/extension-guidelines)
