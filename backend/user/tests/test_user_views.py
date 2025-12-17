from unittest.mock import ANY


def test_user_details(user_client, user_data):
    details = user_client.get("/users/user/")
    assert details.status_code == 200
    assert details.data == {
        "id": ANY,
        "username": user_data["username"],
        "email": user_data["email"],
        "firstName": user_data["first_name"],
        "lastName": user_data["last_name"],
        "isStaff": False,
        "role": "visitor",
        "canCreateProblem": False,
        "canEditProblem": False,
    }


def test_user_updates(user_client, user_data):
    route = "/users/user/"
    details = lambda: user_client.get(route).data
    assert details()["username"] == user_data["username"]

    # update username should succeed
    response = user_client.patch(
        route,
        {"username": "NewName"},
        content_type="application/json",
    )
    assert response.status_code == 200
    assert details()["username"] == "NewName"

    # isStaff is readonly, so nothing should happen
    response = user_client.patch(
        route,
        {"isStaff": True},
        content_type="application/json",
    )
    assert not details()["isStaff"]
