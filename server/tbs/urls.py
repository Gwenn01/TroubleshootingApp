from django.urls import path

from .views import (
    CategoryListView,
    JSONImportView,
)


urlpatterns = [
    path(
        "categories/",
        CategoryListView.as_view()
    ),

    path(
        "import/",
        JSONImportView.as_view()
    ),
]