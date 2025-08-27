# LangPro Annotator functional tests

Functional tests are written using playwright and pytest.

To run the full set of test use the yarn command:
`yarn test-func`


It is sometimes useful (during development) to run a specific test, or to run with a visible browser. To do that, run the bare pytest command, with the correct env from the root of the project:

`PYTHONPATH=.:backend DJANGO_SETTINGS_MODULE=langpro_annotator.settings pytest`

You can then specify the name of the desired tests (using `-k`) or use `--headed` and `--slowmo`.
See `pytest -h | less +"/Playwright"`
