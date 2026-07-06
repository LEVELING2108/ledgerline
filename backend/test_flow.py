import httpx
import json

BASE_URL = "http://127.0.0.1:8080/api/v1"

def run_tests():
    print("=== STARTING END-TO-END FLOW VALIDATION ===")
    
    # 1. Register User
    print("\n1. Registering user...")
    register_payload = {
        "email": "test@ledgerline.com",
        "name": "Test User",
        "password": "Password123"
    }
    with httpx.Client() as client:
        try:
            reg_resp = client.post(f"{BASE_URL}/auth/register", json=register_payload)
            if reg_resp.status_code == 201:
                print("Registration: SUCCESS! User created.")
            elif reg_resp.status_code == 400 and "already exists" in reg_resp.text:
                print("Registration: User already exists. Proceeding to login...")
            else:
                print(f"Registration FAILED: {reg_resp.status_code} - {reg_resp.text}")
                return
        except Exception as e:
            print(f"Error during registration: {str(e)}")
            return

        # 2. Login User
        print("\n2. Logging in...")
        login_data = {
            "username": "test@ledgerline.com",
            "password": "Password123"
        }
        login_resp = client.post(f"{BASE_URL}/auth/login", data=login_data)
        if login_resp.status_code != 200:
            print(f"Login FAILED: {login_resp.status_code} - {login_resp.text}")
            return
        
        token = login_resp.json()["access_token"]
        print("Login SUCCESS! Access token obtained.")
        headers = {"Authorization": f"Bearer {token}"}

        # 3. Upload Transactions CSV
        print("\n3. Uploading mock transactions statement...")
        csv_content = (
            "date,merchant,amount,description\n"
            "2026-07-02,Big Bazaar,-2450.00,Weekly grocery run\n"
            "2026-07-01,Swiggy,-680.00,Dinner order\n"
            "2026-06-30,Ola Cabs,-320.00,Ride to work\n"
            "2026-06-29,Landlord Rent,-18000.00,Monthly rent payment\n"
            "2026-06-27,Airtel,-899.00,Postpaid broadband bill\n"
            "2026-07-03,Luxury Store,-45000.00,Huge purchase\n"
            "2026-07-04,Local Tea Vendor,-45.00,Chai UPI payment\n"
            "2026-07-04,Auto Rickshaw,-80.00,Fare payment\n"
            "2026-07-04,Self Transfer,-10000.00,Transfer to self SBI account\n"
        )
        
        files = {"file": ("statement.csv", csv_content, "text/csv")}
        upload_resp = client.post(f"{BASE_URL}/transactions/upload", headers=headers, files=files)
        if upload_resp.status_code not in (200, 201):
            print(f"Upload FAILED: {upload_resp.status_code} - {upload_resp.text}")
            return
        print(f"Upload SUCCESS! Response: {upload_resp.json()}")

        # 4. Fetch Transactions and verify Categorization
        print("\n4. Checking categorized transactions...")
        tx_resp = client.get(f"{BASE_URL}/transactions/", headers=headers)
        if tx_resp.status_code != 200:
            print(f"Fetching transactions FAILED: {tx_resp.status_code}")
            return
        
        transactions = tx_resp.json()
        print(f"Successfully retrieved {len(transactions)} transactions.")
        for tx in transactions:
            print(f" - {tx['date']} | {tx['merchant']:<15} | Amount: Rs. {tx['amount']:>8.2f} | Category: {tx['category']}")

        # 5. Fetch Alerts and check for Anomalies
        print("\n5. Checking active anomaly alerts...")
        alerts_resp = client.get(f"{BASE_URL}/alerts/", headers=headers)
        if alerts_resp.status_code != 200:
            print(f"Fetching alerts FAILED: {alerts_resp.status_code}")
            return
        
        alerts = alerts_resp.json()
        print(f"Retrieved {len(alerts)} alerts.")
        for alert in alerts:
            print(f" [ALERT] {alert['title']}: {alert['detail'].replace('₹', 'Rs.')}")

        # 6. Query conversational agent (text-to-SQL)
        print("\n6. Querying AI Agent...")
        agent_questions = [
            "how much did I spend on groceries?",
            "how much was my rent?"
        ]
        
        for q in agent_questions:
            print(f"\nQuestion: '{q}'")
            ask_resp = client.post(f"{BASE_URL}/agent/ask", headers=headers, json={"question": q})
            if ask_resp.status_code != 200:
                print(f" Agent query failed: {ask_resp.status_code} - {ask_resp.text}")
                continue
            
            res = ask_resp.json()
            print(f" Agent Answer: {res['answer']}")
            print(f" Generated SQL: {res['trace']}")

    print("\n=== END-TO-END FLOW VALIDATION COMPLETE ===")

if __name__ == "__main__":
    run_tests()
