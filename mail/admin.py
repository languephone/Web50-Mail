from django.contrib import admin

from .models import User, Email

# Register your models here.
class EmailAdmin(admin.ModelAdmin):
	list_display = ("sender", "subject", "read")

admin.site.register(User)
admin.site.register(Email, EmailAdmin)