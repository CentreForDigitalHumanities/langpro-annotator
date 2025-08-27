import os
import pytest
import random
import tempfile
import pexpect


@pytest.fixture(scope='session')
def frontend_server(live_server):
    from django.conf import settings
    if not settings.STATICFILES_DIRS:
        _, port = live_server.url.rsplit(':', 1)
        ng_port = random.randint(10000, 10100)

        # write out a temporary proxy config based on the existing proxy.conf.json
        with open('proxy.conf.json') as source:
            conf = source.read()

        tmp = tempfile.NamedTemporaryFile()
        with open(tmp.name + '.json', 'w') as out:
            out.write(conf.replace(':8000', f':{port}'))

        # this makes the tests slow to start, because it begins with building the angular app
        # maybe there's a way to serve an existing build if it's already there
        ng = pexpect.spawn(f'yarn ng serve --proxy-config {tmp.name}.json --port {ng_port}', cwd='frontend')

        ng.expect('bundle generation complete.')
        yield f'http://localhost:{ng_port}'

        ng.close()
        tmp.close()
    else:
        # the frontend app is served via the staticfiles handler
        yield live_server.url


@pytest.fixture
def as_admin(browser, admin_user, live_server):
    context = browser.new_context()
    page = context.new_page()
    page.goto(live_server.url + "/admin/login")

    page.fill("#id_username", "admin")
    page.fill("#id_password", "password")
    page.get_by_text("Log in").click()
    yield page
