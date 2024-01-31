import random
from llama_index import StorageContext,load_index_from_storage
import torch

class MedGPT_chatbot():

    def __init__(self):
        self.model = torch.hub.load('ultralytics/yolov5', 'custom', path='MedGPT/static/Yolo/best.pt')

    def make_text_prediction(self, text):
        response =  self.answerMe(text)
        return response.response

    def make_image_prediction(self, image):
        
        image = f'MedGPT/static/message_images/{image}'
        result = self.model(image)
        try:
            message = [
                'Its Look Like You are Having a',
                'I think you are having a',
                'Its perfectly look like a',
                'Similar to My knowledge as A Medical model its a'
            ]
            message= message[random.randint(0, len(message)-1)] + ' ' + result.pandas().xyxy[0]['name'].values[0]
        except IndexError:
            message = "Its Doesn't look like you are suffering from anything for now"

        return message
    
    def answerMe(self, question):
        storage_context = StorageContext.from_defaults(persist_dir = 'MedGPT/static/Store')
        index = load_index_from_storage(storage_context)
        query_engine = index.as_query_engine()
        response = query_engine.query(question)
        return response