from django.urls import path
from . import views
from django.conf.urls.static import static
from django.conf import settings
from .forms import UserLoginForm
from django.contrib.auth.views import LoginView, LogoutView

urlpatterns = [
    path('' , LoginView.as_view(
                template_name='auth/ClientAuth/client_login.html',
                authentication_form=UserLoginForm
                ), 
            name='client-login'
        ),
    path('logout/' , LogoutView.as_view(
                        next_page='client-login') , 
                        name='client-logout'
        ),
    path('signup/' , views.client_signup , name='client-signup'),
    path('chatbot/', views.client_chatbot , name='client-chatbot'),
    path('api/get-message/', views.client_get_message , name='client-get-message'),
    path('api/send-message/', views.client_send_message , name='client-send-message'),
    path('api/delete-conversation/<int:pk>', views.client_delete_conversation , name='client-delete-conversation'),
    
]+ static(
        settings.STATIC_URL, 
        document_root=settings.STATIC_ROOT
    )
