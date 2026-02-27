# LangPro Annotator

[![Actions Status](https://github.com/CentreForDigitalHumanities/langpro-annotator/workflows/Unit%20tests/badge.svg)](https://github.com/CentreForDigitalHumanities/langpro-annotator/actions)

An annotation tool for LangPro, a tableau-based theorem prover for natural logic and language.

*This repository is a work in progress, and the README is not yet complete!*

## Introduction

*In this section, provide an overview of your code and describe the project in which the code was developed. Highlight the purpose, scope, and potential uses of your code. Also, consider including links to relevant publications or resources that provide additional context.*

## Getting started

LangPro Annotator is a web application: it can be accessed using a web browser.

*If you are hosting LangPro Annotator anywhere, provide a URL and any additional info.*

You can also run LangPro Annotator locally or host it yourself. Be aware that this is a more advanced option. See [CONTRIBUTING.md](./CONTRIBUTING.md) for information about setting up a local server or configuring deployment.

## Usage

*Provide information about what LangPro Annotator can be used for. If you have written a user manual, this is the place to link it!*

## Development

To get started with developing LangPro Annotator, see [CONTRIBUTING.md](./CONTRIBUTING.md).

## Permission overview

Apart from superusers/admins, the application has three user roles with different permissions. Users with the "Master Annotator" role have full permissions, including managing users and problem visibility/status. Users with the "Annotator" role can browse and annotate both gold and silver problems. Users without any assigned role are considered "Visitors" and can only browse gold problems.

Users can become Annotators or Master Annotators by adding them to the respective user groups in the Django admin interface.

The matrix below shows the permissions for each role. Not all permissions are currently implemented.

(Last updated: November 14th, 2025)

|                          | Unregistered users | Registered Users | Annotators | Master Annotators |
| ------------------------ | ------------------ | ---------------- | ---------- | ----------------- |
| Browse gold problems     | Yes                | Yes              | Yes        | Yes               |
| Browse silver problems   | No                 | Yes              | Yes        | Yes               |
| Browse bronze problems   | No                 | Yes              | Yes        | Yes               |
| Add/edit/remove KB items | No                 | No               | Yes        | Yes               |
| Add labels               | No                 | No               | Yes        | Yes               |
| Remove own labels        | No                 | No               | Yes        | Yes               |
| Remove others' labels    | No                 | No               | No         | Yes               |
| Copy problems            | No                 | No               | No         | Yes               |
| See hidden problems      | No                 | No               | No         | Yes               |
| Gold/ungold problems     | No                 | No               | No         | Yes               |
| Hide/unhide problems     | No                 | No               | No         | Yes               |
| Manage users             | No                 | No               | No         | Yes               |

NB:
- 'Bronze' problems are problems that are 'untouched' (i.e., non-annotated) problems. These do not have knowledge base items or labels, and have no edits made to their syntactic parses and tableaus.
- 'Silver' problems are problems that have been annotated with labels and/or knowledge base items, but have not been marked as 'gold'.
- 'Gold' problems are problems that have been marked as 'gold' by a Master Annotator.

## Licence

This work is shared under a BSD 3-Clause licence. See [LICENSE](./LICENSE) for more information.

## Citation

To cite this repository, please use the metadata provided in [CITATION.cff](./CITATION.cff).

## Contact

LangPro Annotator is developed by [Research Software Lab, Centre for Digital Humanities, Utrecht University](https://cdh.uu.nl/about/research-software-lab/).

*Include contact information. You can also provide clear instructions for how users can provide feedback, contribute, or suggest improvements to your work.*
