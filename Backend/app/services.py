# from app.memory import ImageChatBot
# from app.models import ImageRequest
# import os
# import base64

# class ImageChatBotService:
#     def __init__(self):
#         self.sessions = {}

#     def start_session(self):
#         """Start a new chatbot session."""
#         chatbot = ImageChatBot()
#         self.sessions[chatbot.session_id] = chatbot
#         return chatbot.session_id

#     def get_response(self, session_id, query, image_path):
#         """Get the response for the given session, query, and image."""
#         if session_id not in self.sessions:
#             raise ValueError("Session not found")
        
#         chatbot = self.sessions[session_id]
#         return chatbot.get_response(query, image_path)

#     def stream_response(self, session_id, query, image_path):
#         """Stream the response for the given session."""
#         if session_id not in self.sessions:
#             raise ValueError("Session not found")
        
#         chatbot = self.sessions[session_id]
#         return chatbot.stream_response(query, image_path)

#     def end_session(self, session_id):
#         """End the chatbot session."""
#         if session_id in self.sessions:
#             del self.sessions[session_id]
#             return True
#         return False
