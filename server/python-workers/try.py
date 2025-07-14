import plotly.express as px
import plotly.io as pio
import io
import requests
import os
from dotenv import load_dotenv
 
# Load credentials from .env file
load_dotenv()
 
ACCESS_TOKEN = "EAAIj5oZBczxkBPIZBxr8ErXxzPSlYpZCmt7Kuw4jYXZBQFlnTfvUg6ZBmJhuCzgGfvIHpZAyTSGtZCRUlqsRRE6yOm0uSNHrJA7qkSFkLw8gBog8bG8ELRT088yRYuZAry2rjqZCQlteEsY2cNg3NRlhiTsej5xMTG0Pu3WJPXIQhPlqU1ObYkgEPQ55A1ZA4meIg3I9wedcYe2EiDCv0GEuk4aZCZAf4ik7G7DLveOS"
PHONE_NUMBER_ID = "710478545474469"
 
def generate_chart():

    print("Generating Plotly chart...")
 
    data = {
        'Color': ['Red', 'Blue', 'Yellow'],
        'Votes': [12, 19, 3]
    }
 
    fig = px.bar(
        data,
        x='Color',
        y='Votes',
        color='Color',
        color_discrete_sequence=['#EF476F', '#118AB2', '#FFD166'],
        title='Votes by Color',
        template='plotly_dark',
        labels={'Votes': 'Number of Votes', 'Color': 'Color Category'},
        height=600,
        width=800
    )
 
    fig.update_layout(
        title_font_size=24,
        font=dict(size=16, color='white'),
        plot_bgcolor='#1e1e1e',
        paper_bgcolor='#1e1e1e',
        margin=dict(t=70, b=40, l=40, r=40),
        showlegend=False
    )
 
    # Export to in-memory image
    img_bytes = pio.to_image(fig, format="jpeg", width=800, height=600, scale=2, engine="kaleido")
    buffer = io.BytesIO(img_bytes)
    print("Chart generated successfully.")
    return buffer
 
def upload_to_whatsapp(image_buffer):
    
    print("Uploading chart to WhatsApp...")
    url = f"https://graph.facebook.com/v19.0/{PHONE_NUMBER_ID}/media"
    headers = {
        'Authorization': f'Bearer {ACCESS_TOKEN}'
    }
    files = {
        'file': ('chart.jpg', image_buffer, 'image/jpeg'),
        'type': (None, 'image/jpeg'),
        'messaging_product': (None, 'whatsapp')
    }
 
    response = requests.post(url, headers=headers, files=files)
    if response.status_code == 200:
        media_id = response.json().get('id')
        print(f"Upload successful. media_id: {media_id}")
        return media_id
    else:
        print("Failed to upload image to WhatsApp")
        print("Response:", response.status_code, response.text)
        return None
 
def main():
    chart_buffer = generate_chart()
    media_id = upload_to_whatsapp(chart_buffer)
 
    if media_id:
        print("\n✅ You can now send a WhatsApp message using this media_id:")
        print(media_id)
    else:
        print("\n❌ Could not upload media. Check logs above.")
 
if __name__ == "__main__":
    main()