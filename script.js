 // Database JSON Internal - Daftar Koleksi Buku Perpustakaan
        const libraryBooks = [
            { id: 1, title: 'Dasar Pemrograman Python', author: 'Budi Santoso', category: 'Komputer/IT', status: 'Tersedia', shelf: 'Rak K-01' },
            { id: 2, title: 'Laskar Pelangi', author: 'Andrea Hirata', category: 'Sastra & Novel', status: 'Tersedia', shelf: 'Rak S-05' },
            { id: 3, title: 'Bumi Manusia', author: 'Pramoedya Ananta Toer', category: 'Sastra & Novel', status: 'Dipinjam', shelf: 'Rak S-06' },
            { id: 4, title: 'Biologi Sel Edisi Terbaru', author: 'Neil A. Campbell', category: 'Sains & Alam', status: 'Tersedia', shelf: 'Rak P-03' },
            { id: 5, title: 'Seni Berpikir Jernih (Art of Thinking Clearly)', author: 'Rolf Dobelli', category: 'Pengembangan Diri', status: 'Tersedia', shelf: 'Rak D-02' },
            { id: 6, title: 'Python untuk Pemula & Menengah', author: 'Siti Aminah', category: 'Komputer/IT', status: 'Dipinjam', shelf: 'Rak K-01' },
            { id: 7, title: 'Sejarah Indonesia Modern', author: 'M.C. Ricklefs', category: 'Sejarah', status: 'Tersedia', shelf: 'Rak H-01' },
            { id: 8, title: 'Fisika Dasar Terapan', author: 'Prof. Yohanes Surya', category: 'Sains & Alam', status: 'Tersedia', shelf: 'Rak P-02' },
            { id: 9, title: 'Bumi (Saga Dunia Paralel)', author: 'Tere Liye', category: 'Fiksi Fantasi', status: 'Tersedia', shelf: 'Rak F-01' },
            { id: 10, title: 'Bulan (Saga Dunia Paralel)', author: 'Tere Liye', category: 'Fiksi Fantasi', status: 'Dipinjam', shelf: 'Rak F-01' }
        ];

        // System Prompt untuk LibBot
        const SYSTEM_PROMPT = `
        Kamu adalah "LibBot", asisten AI perpustakaan sekolah yang ramah, hangat, dan sangat membantu siswa mencari buku atau info perpustakaan. 
        Gunakan bahasa Indonesia yang natural, santai namun tetap sopan dan mudah dipahami siswa sekolah. Gunakan sesekali emoji ramah.
        Jawablah dengan singkat, padat, dan jelas (maksimal 2-3 paragraf pendek). 
        
        Koleksi buku saat ini yang terdaftar di perpustakaan kita:
        ${JSON.stringify(libraryBooks)}
        
        Aturan Jawaban:
        1. Jika ditanya mengenai buku yang ada di daftar, sebutkan lokasinya (misal Rak K-01) dan statusnya secara rinci.
        2. Jika dicari buku yang tidak ada atau sedang dipinjam, sarankan buku lain dari kategori sejenis yang statusnya 'Tersedia'.
        3. Jam Buka Perpustakaan: Senin-Kamis (07:00-15:30), Jumat (07:00-14:00), Istirahat (12:00-13:00).
        `;

        // State Aplikasi
        let currentView = 'chat';
        let chatSessions = []; // Menyimpan semua riwayat percakapan
        let activeSessionId = null;
        let isTyping = false;

        // Inisialisasi Aplikasi Saat Membuka Website
        window.onload = function() {
            lucide.createIcons();
            initTheme();
            loadSettings();
            initChatSessions();
            renderKatalog();
            autoFocusInput();
        }

        function switchView(viewName) {
            currentView = viewName;

            // Sembunyikan semua tab section
            document.getElementById('viewChat').classList.add('hidden');
            document.getElementById('viewKatalog').classList.add('hidden');
            document.getElementById('viewInfo').classList.add('hidden');

            // Reset Kelas Desain Tombol Sidebar
            const navButtons = {
                chat: document.getElementById('btnNavChat'),
                katalog: document.getElementById('btnNavKatalog'),
                info: document.getElementById('btnNavInfo')
            };

            for (let btn in navButtons) {
                if (navButtons[btn]) {
                    navButtons[btn].className = "w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-primary-600 dark:hover:text-primary-400 font-medium text-sm";
                }
            }

            // Aktifkan view terpilih & sorot tombol menu aktif
            if (viewName === 'chat') {
                document.getElementById('viewChat').classList.remove('hidden');
                navButtons.chat.className = "w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all bg-primary-50 dark:bg-primary-950/40 text-primary-600 dark:text-primary-400 font-semibold text-sm";
                document.getElementById('viewTitle').innerText = "Tanya LibBot";
                document.getElementById('viewSubtitle').innerText = "Asisten AI Perpustakaan Digital";
                document.getElementById('btnResetChat').classList.remove('invisible');
                autoFocusInput();
            } else if (viewName === 'katalog') {
                document.getElementById('viewKatalog').classList.remove('hidden');
                navButtons.katalog.className = "w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all bg-primary-50 dark:bg-primary-950/40 text-primary-600 dark:text-primary-400 font-semibold text-sm";
                document.getElementById('viewTitle').innerText = "Katalog Buku";
                document.getElementById('viewSubtitle').innerText = "Telusuri Koleksi Buku & Lokasi Rak";
                document.getElementById('btnResetChat').classList.add('invisible');
            } else if (viewName === 'info') {
                document.getElementById('viewInfo').classList.remove('hidden');
                navButtons.info.className = "w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all bg-primary-50 dark:bg-primary-950/40 text-primary-600 dark:text-primary-400 font-semibold text-sm";
                document.getElementById('viewTitle').innerText = "Tentang Perpustakaan";
                document.getElementById('viewSubtitle').innerText = "Profil, Peraturan, & Jam Operasional";
                document.getElementById('btnResetChat').classList.add('invisible');
            }

            // Sembunyikan sidebar di mobile setelah memilih menu
            toggleSidebar(false);
        }

        // Kontrol drawer sidebar di ukuran layar kecil
        function toggleSidebar(shouldShow) {
            const sidebar = document.getElementById('sidebar');
            const overlay = document.getElementById('sidebarOverlay');
            if (shouldShow) {
                sidebar.classList.remove('-translate-x-full');
                overlay.classList.remove('hidden');
            } else {
                sidebar.classList.add('-translate-x-full');
                overlay.classList.add('hidden');
            }
        }
        document.getElementById('sidebarOverlay').addEventListener('click', () => toggleSidebar(false));

        function initTheme() {
            const savedTheme = localStorage.getItem('libbot_theme');
            const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            
            if (savedTheme === 'dark' || (!savedTheme && systemPrefersDark)) {
                document.documentElement.classList.add('dark');
                updateThemeToggleIcon(true);
            } else {
                document.documentElement.classList.remove('dark');
                updateThemeToggleIcon(false);
            }
        }

        function toggleDarkMode() {
            const isDark = document.documentElement.classList.toggle('dark');
            localStorage.setItem('libbot_theme', isDark ? 'dark' : 'light');
            updateThemeToggleIcon(isDark);
        }

        function updateThemeToggleIcon(isDark) {
            const icon = document.getElementById('themeIcon');
            if (isDark) {
                icon.setAttribute('data-lucide', 'sun');
            } else {
                icon.setAttribute('data-lucide', 'moon');
            }
            lucide.createIcons();
        }

        // Mengelola penyimpanan sesi chat siswa di LocalStorage
        function initChatSessions() {
            const localData = localStorage.getItem('libbot_sessions');
            if (localData) {
                chatSessions = JSON.parse(localData);
            }

            // Jika belum ada percakapan, buat sesi pertama
            if (chatSessions.length === 0) {
                createNewSession();
            } else {
                activeSessionId = chatSessions[0].id;
                renderHistoryList();
                renderActiveSessionMessages();
            }
        }

        function createNewSession(firstUserMessage = null) {
            const id = 'session_' + Date.now();
            const welcomeText = 'Halo! 👋 Aku **LibBot**, asisten perpustakaan digital pintarmu. Butuh rekomendasi buku seru, cari lokasi rak, atau ingin bertanya seputar jam operasional perpustakaan? Tulis saja pertanyaanmu di bawah! 😊';
            
            const newSession = {
                id: id,
                title: firstUserMessage ? truncateText(firstUserMessage, 24) : 'Obrolan Baru',
                messages: [
                    { sender: 'bot', text: welcomeText, timestamp: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) }
                ]
            };

            chatSessions.unshift(newSession);
            activeSessionId = id;
            saveSessions();
            renderHistoryList();
            renderActiveSessionMessages();
        }

        function saveSessions() {
            localStorage.setItem('libbot_sessions', JSON.stringify(chatSessions));
        }

        function renderHistoryList() {
            const container = document.getElementById('historyList');
            container.innerHTML = '';

            chatSessions.forEach(session => {
                const isActive = session.id === activeSessionId;
                const activeClasses = isActive 
                    ? "bg-slate-100 dark:bg-slate-800 text-primary-600 dark:text-primary-400 font-semibold"
                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/60";

                const wrapper = document.createElement('div');
                wrapper.className = `group flex items-center justify-between w-full p-2.5 rounded-xl text-xs transition-all cursor-pointer ${activeClasses}`;
                wrapper.setAttribute('onclick', `selectSession('${session.id}')`);
                
                wrapper.innerHTML = `
                    <div class="flex items-center gap-2 truncate pr-1">
                        <i data-lucide="message-square" class="w-3.5 h-3.5 shrink-0 opacity-70"></i>
                        <span class="truncate">${session.title}</span>
                    </div>
                    <button onclick="deleteSession(event, '${session.id}')" class="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-rose-500 p-1 rounded-md hover:bg-slate-200 dark:hover:bg-slate-700 transition-all shrink-0">
                        <i data-lucide="trash-2" class="w-3 h-3"></i>
                    </button>
                `;
                container.appendChild(wrapper);
            });
            lucide.createIcons();
        }

        function selectSession(id) {
            activeSessionId = id;
            renderHistoryList();
            renderActiveSessionMessages();
            switchView('chat');
        }

        function deleteSession(e, id) {
            e.stopPropagation(); // Mencegah pemilihan sesi terpicu
            chatSessions = chatSessions.filter(s => s.id !== id);
            
            if (chatSessions.length === 0) {
                createNewSession();
            } else {
                if (activeSessionId === id) {
                    activeSessionId = chatSessions[0].id;
                }
                saveSessions();
                renderHistoryList();
                renderActiveSessionMessages();
            }
        }

        function resetActiveChat() {
            createNewSession();
            showToast("Memulai obrolan baru!");
        }

        function confirmClearHistory() {
            document.getElementById('confirmModal').classList.remove('hidden');
        }

        function closeConfirmModal() {
            document.getElementById('confirmModal').classList.add('hidden');
        }

        function clearAllHistoryConfirmed() {
            closeConfirmModal();
            chatSessions = [];
            createNewSession();
            showToast("Semua riwayat obrolan dibersihkan.");
        }

        function renderActiveSessionMessages() {
            const container = document.getElementById('chatContainer');
            container.innerHTML = '';

            const session = chatSessions.find(s => s.id === activeSessionId);
            if (!session) return;

            session.messages.forEach(msg => {
                appendMessageToDOM(msg.sender, msg.text, msg.timestamp);
            });
            scrollToBottom();
        }

        function appendMessageToDOM(sender, text, time) {
            const container = document.getElementById('chatContainer');
            const isBot = sender === 'bot';

            const outerWrapper = document.createElement('div');
            outerWrapper.className = `flex gap-3 max-w-[85%] md:max-w-[70%] ${isBot ? '' : 'ml-auto flex-row-reverse'}`;

            const iconAvatar = isBot 
                ? `<div class="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-950 flex items-center justify-center shrink-0 border border-primary-200 dark:border-primary-900 mt-0.5">
                       <i data-lucide="library" class="w-4 h-4 text-primary-600 dark:text-primary-400"></i>
                   </div>`
                : '';

            const bubbleClass = isBot 
                ? 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-bl-none border border-slate-200/50 dark:border-slate-800'
                : 'bg-primary-600 text-white rounded-br-none shadow-sm';

            outerWrapper.innerHTML = `
                ${iconAvatar}
                <div class="flex flex-col gap-1">
                    <div class="px-4 py-3 rounded-2xl text-[13.5px] leading-relaxed ${bubbleClass}">
                        ${parseMarkdown(text)}
                    </div>
                    <span class="text-[9px] text-slate-400 dark:text-slate-500 font-semibold px-1 ${!isBot ? 'text-right' : ''}">${time}</span>
                </div>
            `;

            container.appendChild(outerWrapper);
            lucide.createIcons();
        }

        // Parser text sederhana untuk menebalkan text dengan ** atau baris baru (\n)
        function parseMarkdown(text) {
            return text
                .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                .replace(/\*(.*?)\*/g, '<em>$1</em>')
                .replace(/\n/g, '<br>');
        }

        function scrollToBottom() {
            const container = document.getElementById('chatContainer');
            container.scrollTop = container.scrollHeight;
        }

        function autoFocusInput() {
            document.getElementById('chatInput').focus();
        }

        function handleInputKeydown(event) {
            if (event.key === 'Enter' && !event.shiftKey) {
                event.preventDefault();
                handleSendMessage();
            }
        }

        async function handleSendMessage() {
            const input = document.getElementById('chatInput');
            const rawText = input.value.trim();
            if (!rawText || isTyping) return;

            // Bersihkan bar input
            input.value = '';
            input.style.height = 'auto';

            const timestamp = new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
            
            // Masukkan pesan siswa ke state aktif
            const session = chatSessions.find(s => s.id === activeSessionId);
            if (!session) return;

            // Ganti nama judul obrolan jika itu pesan pertama
            if (session.messages.length === 1 && session.title === 'Obrolan Baru') {
                session.title = truncateText(rawText, 24);
            }

            session.messages.push({ sender: 'user', text: rawText, timestamp: timestamp });
            appendMessageToDOM('user', rawText, timestamp);
            saveSessions();
            renderHistoryList();
            scrollToBottom();

            // Jalankan indikator mengetik
            showTypingIndicator();

            // Panggil API Pintar
            try {
                const aiResponse = await callAIEngine(rawText, session.messages);
                hideTypingIndicator();
                
                const botTimestamp = new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
                session.messages.push({ sender: 'bot', text: aiResponse, timestamp: botTimestamp });
                appendMessageToDOM('bot', aiResponse, botTimestamp);
                saveSessions();
                scrollToBottom();
            } catch (err) {
                console.error(err);
                hideTypingIndicator();
                
                const errorText = "Aduh, jaringanku terputus nih! Silakan periksa koneksi internet atau coba beberapa saat lagi ya... 🔌";
                const errorTimestamp = new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
                session.messages.push({ sender: 'bot', text: errorText, timestamp: errorTimestamp });
                appendMessageToDOM('bot', errorText, errorTimestamp);
                scrollToBottom();
            }
        }

        // Penanganan Quick Action (Mengetuk Tombol Pintasan Cepat)
        function handleQuickAction(actionType) {
            if (actionType === 'Cari Buku') {
                switchView('katalog');
                showToast("Pindah ke Pencarian Buku");
            } else if (actionType === 'Rekomendasi Buku') {
                document.getElementById('chatInput').value = "Berikan aku 3 rekomendasi buku fiksi atau sejarah terbaik hari ini?";
                handleSendMessage();
            } else if (actionType === 'Jam Buka') {
                document.getElementById('chatInput').value = "Perpustakaan buka jam berapa saja?";
                handleSendMessage();
            } else if (actionType === 'Buku Populer') {
                document.getElementById('chatInput').value = "Ada daftar buku populer saat ini di perpustakaan?";
                handleSendMessage();
            }
        }

        // Tampilkan animasi melompat-lompat pertanda AI sedang memikirkan jawaban
        function showTypingIndicator() {
            isTyping = true;
            const container = document.getElementById('chatContainer');
            
            // Hapus yang lama jika ada
            const existing = document.getElementById('typingIndicator');
            if (existing) existing.remove();

            const indicator = document.createElement('div');
            indicator.id = 'typingIndicator';
            indicator.className = 'flex gap-3 max-w-[85%]';
            indicator.innerHTML = `
                <div class="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-950 flex items-center justify-center shrink-0 border border-primary-200 dark:border-primary-900 mt-0.5">
                    <i data-lucide="library" class="w-4 h-4 text-primary-600 dark:text-primary-400"></i>
                </div>
                <div class="bg-slate-100 dark:bg-slate-800 border border-slate-200/50 dark:border-slate-800 px-4 py-3.5 rounded-2xl rounded-bl-none flex items-center gap-1.5 shadow-sm">
                    <div class="w-2 h-2 bg-primary-600 dark:bg-primary-400 rounded-full animate-bounce" style="animation-delay: 0ms"></div>
                    <div class="w-2 h-2 bg-primary-600 dark:bg-primary-400 rounded-full animate-bounce" style="animation-delay: 150ms"></div>
                    <div class="w-2 h-2 bg-primary-600 dark:bg-primary-400 rounded-full animate-bounce" style="animation-delay: 300ms"></div>
                </div>
            `;
            container.appendChild(indicator);
            lucide.createIcons();
            scrollToBottom();
        }

        function hideTypingIndicator() {
            isTyping = false;
            const indicator = document.getElementById('typingIndicator');
            if (indicator) indicator.remove();
        }

        async function callAIEngine(userInput, history) {
            const engine = localStorage.getItem('libbot_api_engine') || 'offline';
            const key = localStorage.getItem('libbot_api_key') || '';

            if (engine === 'openai' && key) {
                // Konfigurasi Panggilan ke OpenAI API
                const url = 'https://api.openai.com/v1/chat/completions';
                const formattedHistory = history.slice(0, -1).map(m => ({
                    role: m.sender === 'bot' ? 'assistant' : 'user',
                    content: m.text
                }));

                const payload = {
                    model: 'gpt-4o-mini',
                    messages: [
                        { role: 'system', content: SYSTEM_PROMPT },
                        ...formattedHistory,
                        { role: 'user', content: userInput }
                    ],
                    temperature: 0.7
                };

                const response = await fetch(url, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${key}`
                    },
                    body: JSON.stringify(payload)
                });

                if (!response.ok) {
                    const errorDetails = await response.text();
                    throw new Error(`OpenAI Error: ${response.status} - ${errorDetails}`);
                }

                const result = await response.json();
                return result.choices[0].message.content;

            } else if (engine === 'gemini' && key) {
                // Konfigurasi Panggilan ke Google Gemini API (3-Flash)
                const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=${key}`;
                const formattedContents = history.slice(0, -1).map(m => ({
                    role: m.sender === 'bot' ? 'model' : 'user',
                    parts: [{ text: m.text }]
                }));

                formattedContents.push({ role: 'user', parts: [{ text: userInput }] });

                const payload = {
                    contents: formattedContents,
                    systemInstruction: {
                        parts: [{ text: SYSTEM_PROMPT }]
                    }
                };

                const response = await fetch(url, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });

                if (!response.ok) {
                    throw new Error(`Gemini API Error: ${response.status}`);
                }

                const result = await response.json();
                return result.candidates[0].content.parts[0].text;

            } else {
                // Simulasi Pintar Offline (Dijalankan tanpa API Key)
                await new Promise(resolve => setTimeout(resolve, 1500)); // Simulasi jeda berpikir
                
                const query = userInput.toLowerCase();
                
                // Cari apakah menyebutkan judul buku
                const matchedBook = libraryBooks.find(b => query.includes(b.title.toLowerCase()) || query.includes(b.author.toLowerCase()));
                
                if (query.includes('rekomendasi') || query.includes('buku seru') || query.includes('rekomendasikan')) {
                    const recommended = libraryBooks.filter(b => b.status === 'Tersedia').slice(0, 3);
                    let reply = "Tentu! Ini beberapa rekomendasi buku seru yang saat ini **Tersedia** dan siap dipinjam: 😊\n\n";
                    recommended.forEach(b => {
                        reply += `📖 **${b.title}** karya *${b.author}* (${b.category}) - Tersimpan di **${b.shelf}**.\n`;
                    });
                    reply += "\nKamu tertarik meminjam yang mana?";
                    return reply;
                }

                if (query.includes('jam') || query.includes('buka') || query.includes('istirahat') || query.includes('tutup')) {
                    return "Halo! Jam operasional perpustakaan sekolah kita adalah:\n\n📅 **Senin - Kamis:** 07:00 - 15:30 WIB\n📅 **Jumat:** 07:00 - 14:00 WIB\n☕ *Jam Istirahat (Tutup Sementara): 12:00 - 13:00 WIB*";
                }

                if (matchedBook) {
                    if (matchedBook.status === 'Tersedia') {
                        return `Ada kok! 😊 Buku **${matchedBook.title}** karya *${matchedBook.author}* saat ini berstatus **${matchedBook.status}**. Kamu bisa langsung mengambilnya di **${matchedBook.shelf}**.`;
                    } else {
                        // Cari alternatif bergenre sejenis
                        const alt = libraryBooks.find(b => b.category === matchedBook.category && b.status === 'Tersedia');
                        let reply = `Aduh, mohon maaf sekali. Buku **${matchedBook.title}** saat ini sedang **Dipinjam** oleh siswa lain. 😢\n\n`;
                        if (alt) {
                            reply += `Sebagai alternatif, aku sangat merekomendasikan buku **${alt.title}** karya *${alt.author}* yang juga membahas kategori *${alt.category}*. Buku ini **Tersedia** di **${alt.shelf}**!`;
                        } else {
                            reply += "Coba tanyakan buku kategori lain yang menarik minatmu!";
                        }
                        return reply;
                    }
                }

                if (query.includes('python') || query.includes('komputer') || query.includes('koding') || query.includes('it')) {
                    return "Ada banget! 😊 Saat ini tersedia buku **Dasar Pemrograman Python** (Tersedia di Rak K-01) dan **Python untuk Pemula & Menengah** (Sedang Dipinjam). Kamu mau fokus mempelajari logika dasar coding atau langsung praktek membuat aplikasi?";
                }

                return "Aku mengerti! Sebagai asisten perpustakaan pintar, aku bisa membantumu mencari info ketersediaan buku, letak rak, atau jam buka perpustakaan. Ada hal yang bisa kubantu sekarang? 😊";
            }
        }

        function renderKatalog() {
            const grid = document.getElementById('katalogGrid');
            grid.innerHTML = '';

            const searchVal = document.getElementById('katalogSearch').value.toLowerCase();
            const catVal = document.getElementById('katalogCategory').value;

            const filtered = libraryBooks.filter(book => {
                const matchesSearch = book.title.toLowerCase().includes(searchVal) || book.author.toLowerCase().includes(searchVal);
                const matchesCat = catVal === "" || book.category === catVal;
                return matchesSearch && matchesCat;
            });

            filtered.forEach(book => {
                const isTersedia = book.status === 'Tersedia';
                const statusBadge = isTersedia
                    ? `<span class="text-[11px] font-bold px-2.5 py-1 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 rounded-lg flex items-center gap-1"><i data-lucide="check" class="w-3.5 h-3.5"></i> ${book.status}</span>`
                    : `<span class="text-[11px] font-bold px-2.5 py-1 bg-rose-50 dark:bg-rose-950/40 text-rose-500 dark:text-rose-400 rounded-lg flex items-center gap-1"><i data-lucide="info" class="w-3.5 h-3.5"></i> ${book.status}</span>`;

                const card = document.createElement('div');
                card.className = "bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-xs hover:shadow-md transition-shadow group flex flex-col justify-between";
                
                card.innerHTML = `
                    <div>
                        <div class="flex justify-between items-start mb-3">
                            <span class="text-[10px] font-bold px-2 py-0.5 bg-primary-50 dark:bg-primary-950/40 text-primary-600 dark:text-primary-400 rounded-md">
                                ${book.category}
                            </span>
                            ${statusBadge}
                        </div>
                        <h4 class="font-bold text-slate-800 dark:text-white mb-1 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">${book.title}</h4>
                        <p class="text-xs text-slate-400 dark:text-slate-500 mb-4">Penulis: ${book.author}</p>
                    </div>
                    
                    <div class="flex items-center justify-between pt-3.5 border-t border-slate-100 dark:border-slate-800 text-xs">
                        <span class="flex items-center gap-1 text-slate-500 dark:text-slate-400 font-semibold">
                            <i data-lucide="map-pin" class="w-3.5 h-3.5 text-slate-400"></i> ${book.shelf}
                        </span>
                        <button onclick="askBotAboutBook('${book.title}')" class="text-primary-600 dark:text-primary-400 hover:text-primary-700 font-bold flex items-center gap-0.5">
                            Tanya Bot <i data-lucide="chevron-right" class="w-3.5 h-3.5"></i>
                        </button>
                    </div>
                `;
                grid.appendChild(card);
            });

            lucide.createIcons();

            const emptyEl = document.getElementById('emptyKatalog');
            if (filtered.length > 0) {
                emptyEl.classList.add('hidden');
            } else {
                emptyEl.classList.remove('hidden');
            }
        }

        function filterKatalog() {
            renderKatalog();
        }

        // Shortcut dari Katalog langsung menuliskan pesan ke chatbot
        function askBotAboutBook(title) {
            switchView('chat');
            document.getElementById('chatInput').value = `Apakah buku "${title}" saat ini siap untuk kupinjam?`;
            handleSendMessage();
        }

        function openSettingsModal() {
            document.getElementById('apiEngine').value = localStorage.getItem('libbot_api_engine') || 'offline';
            document.getElementById('apiKeyInput').value = localStorage.getItem('libbot_api_key') || '';
            toggleApiFields();
            document.getElementById('settingsModal').classList.remove('hidden');
        }

        function closeSettingsModal() {
            document.getElementById('settingsModal').classList.add('hidden');
        }

        function toggleApiFields() {
            const engine = document.getElementById('apiEngine').value;
            const inputContainer = document.getElementById('apiInputContainer');
            if (engine === 'offline') {
                inputContainer.classList.add('hidden');
            } else {
                inputContainer.classList.remove('hidden');
            }
        }

        function saveSettings() {
            const engine = document.getElementById('apiEngine').value;
            const key = document.getElementById('apiKeyInput').value.trim();

            if (engine !== 'offline' && !key) {
                showToast("Kunci API wajib diisi jika memilih mesin eksternal.");
                return;
            }

            localStorage.setItem('libbot_api_engine', engine);
            localStorage.setItem('libbot_api_key', key);
            
            closeSettingsModal();
            showToast("Pengaturan berhasil disimpan!");
        }

        function loadSettings() {
            // Memastikan data tersimpan ter-load dengan baik
            const engine = localStorage.getItem('libbot_api_engine') || 'offline';
            const key = localStorage.getItem('libbot_api_key') || '';
        }

        // Pemotong teks panjang untuk mempercantik judul riwayat obrolan di sidebar
        function truncateText(text, maxLength) {
            if (text.length > maxLength) {
                return text.substring(0, maxLength) + '...';
            }
            return text;
        }

        // Notifikasi toast melayang di tengah layar (menggantikan alert browser yang mengganggu)
        function showToast(message) {
            const toast = document.createElement('div');
            toast.className = 'fixed bottom-6 left-1/2 -translate-x-1/2 bg-slate-800 dark:bg-slate-700 text-white text-xs font-semibold px-4.5 py-2.5 rounded-xl shadow-lg z-50 transition-opacity duration-300 opacity-0';
            toast.innerText = message;
            
            document.body.appendChild(toast);
            
            setTimeout(() => toast.classList.remove('opacity-0'), 10);
            
            setTimeout(() => {
                toast.classList.add('opacity-0');
                setTimeout(() => toast.remove(), 300);
            }, 2500);
        }