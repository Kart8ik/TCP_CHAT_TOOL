# **TCP Chat App (Mini-Project Idea)**  

### **Overview**  
We're building a **real-time chat application using TCP sockets**. Unlike UDP-based chat tools, this will ensure **reliable message delivery** and support **multiple users in a chatroom**.  

### **Key Features**  
✅ Uses **TCP sockets** for stable and ordered communication.  
✅ **Multi-user chatroom** where messages are broadcast to everyone.  
✅ Basic **username system** to identify users.  
✅ **Server-client architecture** (one server, multiple clients).  
✅ **Command-line interface (CLI)** for now (GUI can be added later).  

### **Tech Stack**  
- **Python** (socket programming, threading for handling multiple users).  
- (Optional) **Tkinter/Flask** for a basic UI if we want to extend it.  

### **Future Enhancements (If Time Permits)**  
🔥 Private messaging (DMs).  
🔥 Message encryption for security.  
🔥 Web-based frontend (React + Flask).  

---  
### **How We’ll Build It**  
1. **Server** → Listens for incoming connections, manages users, and broadcasts messages.  
2. **Client** → Connects to the server, sends/receives messages, and displays them in real-time.  

---  
### **Why This Project?**  
- **Hands-on with socket programming** (essential for networking).  
- **Understand how real-world chat apps work** under the hood.  
- **Good balance of simplicity + complexity** for a mini-project.  
