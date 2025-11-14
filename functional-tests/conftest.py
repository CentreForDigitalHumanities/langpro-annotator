import datetime
import os
import pytest
import random
import requests
import subprocess
import sys
import tempfile

def wait_for_server(url, timeout=60):
    start = datetime.datetime.now()
    while (datetime.datetime.now() - start).seconds < timeout:
        try:
            r = requests.get(url, timeout=timeout)
            if not r.ok:
                raise RuntimeError(f'Error waiting for {url}')
        except (requests.exceptions.ConnectionError, requests.exceptions.Timeout):
            continue
        # connect succeeded
        return
    raise TimeoutError(f'Timeout waiting for {url} to be available')

from playwright.sync_api import expect

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
        shell = sys.platform == 'win32'
        ng = subprocess.Popen(f'yarn ng serve --proxy-config {tmp.name}.json --port {ng_port}'.split(), cwd='frontend', shell=shell)
        url = f'http://localhost:{ng_port}'
        wait_for_server(url)
        yield url

        ng.kill()
        tmp.close()
    else:
        # the frontend app is served via the staticfiles handler
        yield live_server.url


@pytest.fixture
def admin_panel(browser, admin_user, live_server):
    context = browser.new_context()
    page = context.new_page()
    page.goto(live_server.url + "/admin/login")

    page.fill("#id_username", "admin")
    page.fill("#id_password", "password")
    page.get_by_text("Log in").click()
    yield page


@pytest.fixture
def as_admin(browser, admin_user, frontend_server):
    context = browser.new_context()
    page = context.new_page()
    page.goto(frontend_server + '/login')

    page.fill("#username", "admin")
    page.fill("#password", "password")
    page.get_by_role("button", name="Sign in").click()
    expect(page.get_by_role("button", name="Sign in")).not_to_be_visible()
    yield page
