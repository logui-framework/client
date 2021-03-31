# LogUI Changelog

This Markdown file contains the `CHANGELOG` for the LogUI client library. Changes are made as per the [GNU CHANGELOG Style Guide](https://www.gnu.org/prep/standards/html_node/Style-of-Change-Logs.html).

```

2020-09-14  Version 0.4.0

    Implemented basic repository structure, including working build and test environment. Repository ready for the addition of existing library code.

    * NPM is the selected package manager.
    * package.json contains the necessary infrastructure to build and test the project.
    * Sample test sample.spec.js included.
    * .gitignore is included.

2021-03-26  Version 0.5.0

    Basic implementation now complete. All basic functionality has been included, along with communicative ability to the LogUI server component.

2021-03-26  Version 0.5.1

    Works with LogUI server version 0.5.1 and above.

    Altered the configuration object to include an authorisation token, not an authentication token. Tidying up terminology.

2021-03-31  Version 0.5.2

    Works with LogUI server version 0.5.1 and above.

    Altered the behaviour of the eventCallbackHandler to prevent event bubbling.
    Updated the websocketDispatcher to suppress logging when verbose is set to false.
```