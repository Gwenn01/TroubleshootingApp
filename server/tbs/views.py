import json

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

from .models import Category
from .serializers import CategorySerializer
from .services.json_importer import JSONImportService


class CategoryListView(APIView):

    def get(self, request):

        categories = Category.objects.filter(
            is_active=True
        )

        serializer = CategorySerializer(
            categories,
            many=True
        )

        return Response(serializer.data)
    
    def post(self, request):

        serializer = CategorySerializer(
            data=request.data
        )

        if serializer.is_valid():
            category = serializer.save()

            return Response(
                {
                    "message": "Category created successfully.",
                    "category": CategorySerializer(category).data
                },
                status=status.HTTP_201_CREATED
            )

        return Response(
            {
                "error": "Invalid category data.",
                "details": serializer.errors
            },
            status=status.HTTP_400_BAD_REQUEST
        )


class JSONImportView(APIView):

    def post(self, request):

        # -----------------------------------------
        # Get category
        # -----------------------------------------

        category_id = request.data.get(
            "category_id"
        )

        if not category_id:
            return Response(
                {
                    "error": "category_id is required."
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            category = Category.objects.get(
                id=category_id,
                is_active=True
            )

        except Category.DoesNotExist:
            return Response(
                {
                    "error": "Category not found."
                },
                status=status.HTTP_404_NOT_FOUND
            )

        # -----------------------------------------
        # Get file
        # -----------------------------------------

        uploaded_file = request.FILES.get(
            "file"
        )

        if not uploaded_file:
            return Response(
                {
                    "error": "JSON file is required."
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        # -----------------------------------------
        # Read JSON
        # -----------------------------------------

        try:
            content = uploaded_file.read().decode(
                "utf-8"
            )

            data = json.loads(content)

        except UnicodeDecodeError:
            return Response(
                {
                    "error": "File must be UTF-8 encoded."
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        except json.JSONDecodeError as e:
            return Response(
                {
                    "error": "Invalid JSON file.",
                    "details": str(e),
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        # -----------------------------------------
        # Import
        # -----------------------------------------

        try:

            result = JSONImportService.import_data(
                data=data,
                category=category
            )

        except Exception as e:

            return Response(
                {
                    "error": "Import failed.",
                    "details": str(e),
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        return Response(
            {
                "message": "Import completed.",
                "category": category.name,
                "result": result,
            },
            status=status.HTTP_200_OK
        )ate your views here.
