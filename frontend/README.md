# LangPro Annotator frontend

## Import ProofBank data

LangPro Annotator can be used to browse and annotate problems from the ProofBank dataset, which is a collection of problems from both the [SICK (Sentences Involving Compositional Knowledge)][1] and FraCaS (Framework for Computational Semantics) datasets. For more information about these datasets, see the [References](#references) section below.

To load these problems in, you need to follow the steps below:
- Obtain the SICK data [here][1] and put it in the project folder as `backend/problem/data/sick.txt`.
- Obtain the FraCaS data [here][2] and put it in the project folder as `backend/problem/data/fracas.xml`.
- Run `python manage.py import_sick`
- Run `python manage.py import_fracas`

[1]: http://clic.cimec.unitn.it/composes/sick.html
[2]: https://www-nlp.stanford.edu/~wcmac/downloads/


## References

- [SICK dataset](http://clic.cimec.unitn.it/composes/sick.html) (Project page and download link)
- Marelli, M., Menini, S., Baroni, M., Bentivogli, L., Bernardi, R., and Zamparelli, R. (2014b). A sick cure for the evaluation of compositional distributional semantic models. LREC 2014, pages 216–223. [PDF](http://www.lrec-conf.org/proceedings/lrec2014/pdf/363_Paper.pdf)
- [FraCaS dataset](https://www-nlp.stanford.edu/~wcmac/downloads/) (represented in XML by [Bill MacCartney](https://www-nlp.stanford.edu/~wcmac/)).

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
