# auto_crm/sms.py

def send_sms_notification(phone_number, message):
    """
    Simulates sending an SMS by printing to the server console.
    Replace this logic with Twilio/AWS SNS later for real texts.
    """
    print("\n" + "="*40)
    print(f"📱 [SMS SENT] to {phone_number}")
    print(f"💬 MESSAGE: {message}")
    print("="*40 + "\n")