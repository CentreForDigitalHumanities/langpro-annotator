def test_langpro_annotator_frontend(browser, base_address):
    print('Base address:', base_address)
    browser.get(base_address)
    try:
        assert 'LangPro Annotator' in browser.title
    except:
        print(browser.title)
        raise


def test_langpro_annotator_admin(browser, admin_address):
    browser.get(admin_address)
    try:
        assert 'Django' in browser.title
    except:
        print(browser.title)
        raise


def test_langpro_annotator_api(browser, api_address):
    browser.get(api_address)
    try:
        assert 'Api Root' in browser.title
    except:
        print(browser.title)
        raise


def test_langpro_annotator_api_auth(browser, api_auth_address):
    browser.get(api_auth_address + 'login/')
    try:
        assert 'Django REST framework' in browser.title
    except:
        print(browser.title)
        raise
