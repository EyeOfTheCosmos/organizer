    // Import Firebase SDKs from CDN
    import { initializeApp } from 'https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js';
    import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js';
    import { getFirestore, collection, addDoc, query, where, onSnapshot, doc, deleteDoc } from 'https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js';

    // Your actual configuration
    const firebaseConfig = {
      apiKey: "AIzaSyCKkhmAY4QKWLtbtJvzfoNrUqOl61-GfWg",
      authDomain: "helixnebula.firebaseapp.com",
      projectId: "helixnebula",
      storageBucket: "helixnebula.firebasestorage.app",
      messagingSenderId: "104590312857",
      appId: "1:104590312857:web:9c43300d2d8855199f3f08"
    };

    const app = initializeApp(firebaseConfig);
    const auth = getAuth(app);
    const db = getFirestore(app);

    // UI Elements
    const authSec = document.getElementById('auth-section');
    const appSec = document.getElementById('app-section');
    const todoList = document.getElementById('todo-list');
    let unsubscribeTodos;

    // Auth state observer
    onAuthStateChanged(auth, (user) => {
      if (user) {
        authSec.classList.add('hidden');
        appSec.classList.remove('hidden');
        //document.getElementById('user-display').textContent = user.email;
        loadTodos(user.uid);
      } else {
        authSec.classList.remove('hidden');
        appSec.classList.add('hidden');
        todoList.innerHTML = '';
        if (unsubscribeTodos) unsubscribeTodos();
      }
    });

    // Auth Handlers
    document.getElementById('signup-btn').onclick = () => createUserWithEmailAndPassword(auth, email.value, password.value).catch(err => alert(err.message));
    document.getElementById('login-btn').onclick = () => signInWithEmailAndPassword(auth, email.value, password.value).catch(err => alert(err.message));
    document.getElementById('logout-btn').onclick = () => signOut(auth);

    // Add To-Do Item
    document.getElementById('add-todo-btn').onclick = async () => {
      const text = document.getElementById('todo-input').value;
      if (!text.trim()) return;

      await addDoc(collection(db, "todos"), {
        task: text,
        userId: auth.currentUser.uid,
        createdAt: new Date()
      });
      document.getElementById('todo-input').value = '';
    };
    // Attach the listener to your parent todoList element in app.js
    todoList.onclick = async (event) => {
    // If the user clicks on a delete button
    if (event.target.classList.contains('delete-btn')) {
        const todoId = event.target.getAttribute('data-id');
        try {
        // Execute the delete operation on the specified document
        await deleteDoc(doc(db, "todos", todoId));
        console.log("Task successfully deleted from Firestore!");
        } catch (error) {
        console.error("Error removing task: ", error);
        }
    }
    };


    // Load To-Dos dynamically matching the user's ID
    function loadTodos(uid) {
  const q = query(collection(db, "todos"), where("userId", "==", uid));
  unsubscribeTodos = onSnapshot(q, (snapshot) => {
    todoList.innerHTML = snapshot.docs.map(doc => `
      <li style="display: flex; justify-content: space-between; align-items: center; margin: 5px 0;">
        <span>${doc.data().task}</span>
        <button class="delete-btn" data-id="${doc.id}">✕</button>
      </li>
    `).join('');
  });
}
