import pytest
from problem.models import Problem, Sentence

from playwright.sync_api import Page, expect

@pytest.fixture
def sample_problem(db):
    hypothesis = Sentence.objects.create(
        text='The test is well-written'
    )

    problem = Problem.objects.create(
        hypothesis=hypothesis,
        dataset='user',
        entailment_label='neutral',
        extra_data={}
    )
    problem.premises.create(
        text='Every well-written test works on first try'
    )
    problem.premises.create(
        text='The test did not work on first attempt'
    )
    yield problem


def test_kb_annotation(frontend_server, sample_problem, as_admin: Page):
    page = as_admin
    page.goto(frontend_server + f'/annotate/{sample_problem.pk}')

    page.get_by_role('button', name='Add knowledge base item').click()
    page.locator('[placeholder="Entity 1"]').fill('Try')
    page.locator('[placeholder="Entity 2"]').fill('Attempt')

    expect(page.locator('body')).to_contain_text('Annotation modified')
    page.get_by_text('Save').click()
    expect(page.locator('body')).not_to_contain_text('Annotation modified')

    # after refresh, newly saved KBs should be visible
    page.goto(frontend_server + f'/annotate/{sample_problem.pk}')
    expect(page.locator('[placeholder="Entity 1"]')).to_have_value('Try')
    expect(page.locator('[placeholder="Entity 2"]')).to_have_value('Attempt')

    # modify an existing KB item (it'll create a new annotation session)
    page.locator('[placeholder="Entity 1"]').fill('Pizza')
    page.locator('la-knowledge-base-form select').select_option('is a subset of')
    page.locator('[placeholder="Entity 2"]').fill('Food')
    page.get_by_text('Save').click()

    # after refresh, should be visible
    page.goto(frontend_server + f'/annotate/{sample_problem.pk}')
    expect(page.locator('[placeholder="Entity 1"]')).to_have_value('Pizza')
    expect(page.locator('la-knowledge-base-form select')).to_have_value('SUBSET')
    expect(page.locator('[placeholder="Entity 2"]')).to_have_value('Food')
