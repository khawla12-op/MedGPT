from django.shortcuts import render , redirect
from .forms import UserRegisterForm
from django.contrib import messages
from django.contrib.auth.decorators import login_required
from .models import Conversation, Message
from django.http import JsonResponse
from django.core import serializers
from .chatbot import MedGPT_chatbot

# instantiate the chatbot
chatbot = MedGPT_chatbot()

# Create your views here.
def client_signup(request):
    if request.method == 'POST':
        form = UserRegisterForm(request.POST)
        if form.is_valid():
            form.save()
            messages.success(request , f'Your account has been created! You are now able to log in')
            return redirect('client-login')
        messages.error(request , f'Please correct the error below.')
    form = UserRegisterForm()
    return render(request ,
                    'auth/ClientAuth/client_signup.html',
                    {
                        'title' : 'Client Signup',
                        'form' : form
                    }
                )

# This is the most important part of the code
@login_required
def client_chatbot(request):
    if request.method == 'POST':
        Conversation.objects.create(
            user = request.user,
            name = request.POST.get('name_chat')
        )
        return redirect('client-chatbot')
    conversations = Conversation.objects.filter(user=request.user)
    return render(request ,
                    'app/Chatbot/client_chatbot.html',
                    {
                        'title' : 'Chat Interface',
                        'conversations' : conversations
                    }
                )

def client_delete_conversation(request, pk):
    conversation = Conversation.objects.get(id=pk)
    conversation.delete()
    return redirect('client-chatbot')

def client_get_message(request):
    conversation_id = request.GET.get('conversation_id')
    conversation = Conversation.objects.get(id=conversation_id)
    messages = Message.objects.filter(conversation=conversation)
    data = serializers.serialize('json', messages)
    return JsonResponse(data, safe=False)

def client_send_message(request):

    if request.POST.get('image') == '':
        conversation = Conversation.objects.get(id=request.POST.get('conversation_id'))
        Message.objects.create(
            content = request.POST.get('content'),
            conversation = conversation
        )
        predict = chatbot.make_text_prediction(request.POST.get('content'))
        message = Message.objects.create(
            content = predict,
            conversation = conversation
        )
        data = serializers.serialize('json', [message,])
        return JsonResponse(data, safe=False)
    
    else :
        conversation = Conversation.objects.get(id=request.POST.get('conversation_id'))
        Message.objects.create(
            content = request.POST.get('message'),
            image = request.FILES.get('image'),
            conversation = conversation
        )
        predict = chatbot.make_image_prediction(request.FILES.get('image'))
        message = Message.objects.create(
            content = predict,
            conversation = conversation
        )
        data = serializers.serialize('json', [message,])
        return JsonResponse(data, safe=False)


# Error 404
def error_404(request, exception):
    return render(request,'error/404.html')

# Error 500
def error_500(request):
    return render(request,'error/500.html')