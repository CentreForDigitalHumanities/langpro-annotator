# LangPro Annotator frontend

## Before you start
You need to install the following software:
 - Node ^18.19.1 || ^20.11.1 || >=22.0.0

Run `yarn` to install the requirements for the frontend.

## Import ProofBank data

LangPro Annotator can be used to browse and annotate problems from the ProofBank dataset, which is a collection of problems from the following datasets:
- [SICK (Sentences Involving Compositional Knowledge)][1]
- [FraCaS (Framework for Computational Semantics)][2]
- [SNLI (Stanford Natural Language Inference)][3]

For more information about these datasets, see the [References](#references) section below.

To load these problems in, follow the steps below:
- Obtain the SICK data [here][1] and put it in the project folder as `backend/problem/data/sick.txt`.
- Obtain the FraCaS data [here][2] and put it in the project folder as `backend/problem/data/fracas.xml`.
- Obtain the SNLI data [here][3] and put the files that you want to import in the project folder as `backend/problem/data/snli_1.0_dev.txt`.
- Run `python manage.py import_sick`
- Run `python manage.py import_fracas`
- Run `python manage.py import_snli`

NB: the command `import_snli` will only import the development set (10K problems), not the full dataset. If you want to import the full dataset, you can use the `--full` flag: `python manage.py import_snli --full`. This will import the dev set (10K problems), the train set (550K problems) and the test set (10K problems). The full dataset will take a few minutes to import, so be warned.

[1]: http://clic.cimec.unitn.it/composes/sick.html
[2]: https://www-nlp.stanford.edu/~wcmac/downloads/
[3]: https://nlp.stanford.edu/projects/snli/


## References

- [SICK dataset](http://clic.cimec.unitn.it/composes/sick.html) (Project page and download link)
- Marelli, M., Menini, S., Baroni, M., Bentivogli, L., Bernardi, R., and Zamparelli, R. (2014b). A sick cure for the evaluation of compositional distributional semantic models. LREC 2014, pages 216–223. [PDF](http://www.lrec-conf.org/proceedings/lrec2014/pdf/363_Paper.pdf)
- [FraCaS dataset](https://www-nlp.stanford.edu/~wcmac/downloads/) (represented in XML by [Bill MacCartney](https://www-nlp.stanford.edu/~wcmac/)).
- [SNLI 1.0 dataset](https://nlp.stanford.edu/projects/snli/) (Project page and download link)
- Bowman, S. R., Angeli, G., Potts, C., and Manning, C. D. (2015). A large annotated corpus for learning natural language inference. In Proceedings of the 2015 Conference on Empirical Methods in Natural Language Processing, pages 632–642, Lisbon, Portugal. Association for Computational Linguistics. [PDF](https://aclanthology.org/D15-1075.pdf)


## Development server

Run `yarn start` for a dev server. Navigate to `http://localhost:4200/`. This will not start the backend, to developing with a functioning backend use `yarn start` from the project root instead. Navigate to `http://localhost:8000/`, which will forward to the frontend.

## Code scaffolding

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module`.

## Build

Run `yarn build` to build the project. The build artifacts will be stored in the `dist/` directory.

With SSR (Server Side Rendering) all the routes will be pre-compiled. Because of this the backend server should already be running before building the frontend!

## Running unit tests

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).

## Localize

Run `yarn serve:nl` for a Dutch version.
Run `yarn i18n` to generate a new xlf file. This XLIFF file can be localized using for example [Poedit](https://poedit.net/).

## Further help

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI README](https://github.com/angular/angular-cli/blob/master/README.md).
