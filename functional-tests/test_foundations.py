def test_langpro_annotator_frontend(page, frontend_server):
    page.goto(frontend_server)
    assert 'LangPro Annotator' in page.title()
