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

The overview below shows the permissions for each role. Not all permissions are currently implemented.

(Last updated: November 14th, 2025)

|                            | Visitor | Annotator | Master Annotator |
| -------------------------- | ------- | --------- | ---------------- |
| Browse gold problems       | Yes     | Yes       | Yes              |
| Browse silver problems     | No      | Yes       | Yes              |
| Edit KB items              | No      | Yes       | Yes              |
| Add labels                 | No      | Yes       | Yes              |
| Remove own labels          | No      | Yes       | Yes              |
| Remove other users' labels | No      | No        | Yes              |
| Add problems               | No      | No        | Yes              |
| Copy problems              | No      | No        | Yes              |
| Update user problems       | No      | No        | Yes              |
| Delete problems            | No      | No        | Yes              |
| Edit existing problems     | No      | No        | Yes              |
| See hidden problems        | No      | No        | Yes              |
| Silver/gold problems       | No      | No        | Yes              |
| Hide/unhide problems       | No      | No        | Yes              |
| Manage users               | No      | No        | Yes              |

## Licence

This work is shared under a BSD 3-Clause licence. See [LICENSE](./LICENSE) for more information.

## Citation

To cite this repository, please use the metadata provided in [CITATION.cff](./CITATION.cff).

## Contact

LangPro Annotator is developed by [Research Software Lab, Centre for Digital Humanities, Utrecht University](https://cdh.uu.nl/about/research-software-lab/).

*Include contact information. You can also provide clear instructions for how users can provide feedback, contribute, or suggest improvements to your work.*
