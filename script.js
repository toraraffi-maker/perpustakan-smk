// Database JSON Internal - Daftar Koleksi Buku Perpustakaan Baru & Lengkap Deskripsi
        const libraryBooks = [
            { 
                id: 1, 
                title: 'Dasar-Dasar Pengembangan Perangkat Lunak dan Gim', 
                author: 'Okta Purnawirawan', 
                category: 'IT', 
                status: 'Tersedia', 
                shelf: 'Rak IT-01',
                description: 'Buku ini adalah panduan lengkap pengantar dunia pemrograman kejuruan (PPLG) kelas X SMK. Membahas dasar-dasar algoritma, logika pemrograman komputer, pengenalan tools coding terpopuler, hingga konsep industri kreatif pembuatan game serta perencanaan karir di industri perangkat lunak.'
            },
            { 
                id: 2, 
                title: 'Tanah Para Bandit', 
                author: 'Tere Liye', 
                category: 'Novel', 
                status: 'Tersedia', 
                shelf: 'Rak NV-01',
                description: 'Sebuah novel aksi petualangan epik dari penulis ternama Tere Liye. Mengisahkan tentang perjuangan karakter utama bernama Soleh dalam menghadapi ketidakadilan sosial, konspirasi politik gelap, serta perjalanannya melawan komplotan kriminal mafia penjahat kelas kakap dengan pesan mendalam tentang loyalitas dan integritas diri.'
            },
            { 
                id: 3, 
                title: 'Manusia dan Badainya', 
                author: 'Syahid Muhammad', 
                category: 'Novel', 
                status: 'Dipinjam', 
                shelf: 'Rak NV-02',
                description: 'Buku fiksi pengembangan diri yang sangat menyentuh hati remaja. Menjelaskan tentang eksplorasi mendalam atas isu kesehatan mental, perjuangan menghadapi badai emosional masa transisi dewasa muda, cara memahami kecemasan psikologis, serta petunjuk berdamai dengan luka masa lalu demi tumbuh lebih tangguh.'
            },
            { 
                id: 4, 
                title: 'Digital Branding', 
                author: 'Devi Puspitasari', 
                category: 'Pemasaran', 
                status: 'Tersedia', 
                shelf: 'Rak PM-01',
                description: 'Buku panduan praktis pemasaran digital modern. Membahas esensi pembentukan identitas brand secara online, cara melakukan riset target audiens di media sosial, teknik penulisan konten promosi yang persuasif, metode optimalisasi SEO, serta kiat-kiat sukses membangun citra produk UKM di era digital.'
            },
            { 
                id: 5, 
                title: 'Menerapkan Desain Brief', 
                author: 'A. Bobo Wasono', 
                category: 'DKV', 
                status: 'Tersedia', 
                shelf: 'Rak DK-01',
                description: 'Buku wajib untuk siswa DKV (Desain Komunikasi Visual). Fokus mengupas cara membaca dan merumuskan instruksi desain kerja (design brief) dari klien, metodologi penerjemahan konsep kreatif menjadi karya visual komersial bernilai jual, serta etika profesionalitas desainer visual.'
            },
            { 
                id: 6, 
                title: 'Administrasi Umum', 
                author: 'Sri Endang R.', 
                category: 'Manajemen', 
                status: 'Dipinjam', 
                shelf: 'Rak MJ-01',
                description: 'Buku kejuruan manajemen perkantoran dasar yang membahas tata cara administrasi operasional. Isinya mencakup pengenalan struktur organisasi perkantoran, manajemen kearsipan dokumen fisik & digital, teknik korespondensi (surat-menyurat) formal yang efisien, serta pelayanan prima bagi tamu bisnis.'
            }
        ];

        // System Prompt Ketat untuk Mengendalikan Bot agar Tetap On-Topic
        const SYSTEM_PROMPT = `
        Nama kamu adalah "LibBot", asisten AI perpustakaan sekolah PerpusSMK yang ramah, hangat, dan profesional.
        Gunakan bahasa Indonesia yang natural, sopan, sedikit santai, dan mudah dimengerti anak sekolah. Selalu gunakan emoji ramah.
        
        ATURAN STRATEGIS:
        1. Kamu HANYA diperbolehkan menjawab pertanyaan seputar perpustakaan PerpusSMK:
           - Koleksi buku, ketersediaan, pengarang, deskripsi buku, dan lokasi rak.
           - Jam Operasional: Senin-Kamis (07:00-15:00 WIB), Jumat (07:00-11:00 WIB). Istirahat (12:00-13:00 WIB, tutup sementara).
           - Aturan meminjam: Maksimal 3 buku, batas waktu 7 hari, denda keterlambatan Rp500/hari.
           - Pengelola: Kepala pustakawan Ibu Budiarti, S.I.Pust.
        2. Jika pengguna menanyakan hal yang sama sekali TIDAK RELEVAN/Luar Topik (misalnya: resep masakan, pemrograman murni seperti "buatkan kode web python", matematika sekolah, politik global, cuaca, dll), jawablah dengan sopan:
           "Aduh maaf ya... 😅 Sebagai asisten PerpusSMK, aku hanya diprogram untuk membantumu seputar perpustakaan, aturan pinjam, dan rekomendasi buku-buku kita di sini. Yuk, tanyakan seputar buku menarik yang ingin kamu baca!"
        3. Jika pengguna menanyakan sinopsis, isi, atau deskripsi buku, jelaskan dengan detail menggunakan info dari database berikut:
        ${JSON.stringify(libraryBooks)}
        4. Jawablah secara singkat, jelas, padat (maksimal 2-3 paragraf pendek) agar siswa tidak lelah membaca jawaban panjang lebar.
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
            const welcomeText = 'Halo! 👋 Aku **LibBot**, asisten perpustakaan digital PerpusSMK. Butuh info detail buku, rekomendasi bacaan seru, tata cara peminjaman, atau mencari lokasi rak? Tulis aja pertanyaanmu di bawah! 😊';
            
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
                document.getElementById('chatInput').value = "Berikan aku rekomendasi buku yang paling cocok dibaca saat ini?";
                handleSendMessage();
            } else if (actionType === 'Jam Buka') {
                document.getElementById('chatInput').value = "Perpustakaan buka jam berapa?";
                handleSendMessage();
            } else if (actionType === 'Aturan Peminjaman') {
                document.getElementById('chatInput').value = "Apa saja syarat, tata tertib, denda, dan aturan meminjam buku di PerpusSMK?";
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
                // Konfigurasi Panggilan ke OpenAI API (GPT-4o-mini)
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
                    temperature: 0.3 // Diturunkan agar lebih stabil dan tidak berhalusinasi
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
                    },
                    generationConfig: {
                        temperature: 0.2
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
                // SIMULASI OFFLINE SUPER AKURAT (Mesin Logika Bahasa Pengganti API)
                await new Promise(resolve => setTimeout(resolve, 1200)); 
                const query = userInput.toLowerCase().trim();

                // 1. Saringan Pembatasan Out of Topic (OOT) secara ketat
                const keywordsPenunjang = [
                    'buku', 'novel', 'perpus', 'rak', 'buka', 'tutup', 'jam', 'denda', 'pinjam', 'kembali', 'kembalikan',
                    'syarat', 'aturan', 'tata tertib', 'pustakawan', 'petugas', 'pengelola', 'budiarti', 'rekomendasi',
                    'it', 'gim', 'pplg', 'desain', 'dkv', 'pemasaran', 'manajemen', 'sinopsis', 'isi', 'tentang', 'jelaskan',
                    'halo', 'hai', 'pagi', 'siang', 'sore', 'malam', 'assalamualaikum', 'salam', 'terima kasih', 'makasih', 'bot'
                ];

                // Memeriksa apakah ada kata penunjang perpustakaan dalam query
                const hasRelevance = keywordsPenunjang.some(kw => query.includes(kw));
                
                // Tambahan deteksi pertanyaan OOT umum (Matematika murni, coding murni di luar konteks buku, resep makanan, dll)
                const isExplicitOot = query.includes('resep') || query.includes('memasak') || 
                                     (query.includes('buatkan') && query.includes('code')) || 
                                     query.includes('cuaca') || query.includes('presiden') || 
                                     query.includes('hitunglah') || query.includes('matematika');

                if (!hasRelevance || isExplicitOot) {
                    return "Aduh, maaf ya... 😅 Sebagai asisten **PerpusSMK**, aku hanya dilatih untuk membantumu menjawab seputar perpustakaan, aturan pinjam, lokasi rak, serta koleksi buku-buku kita. \n\nYuk, tanyakan hal seru tentang buku atau seputar operasional PerpusSMK!";
                }

                // 2. Intent Sapaan / Terima kasih
                if (query.match(/^(halo|hai|pagi|siang|sore|malam|assalamualaikum|permisi|ping)/)) {
                    return "Halo! 👋 Aku **LibBot**, asisten AI PerpusSMK yang siap membantumu. Ada buku yang ingin dicari, butuh sinopsis, atau ingin bertanya soal jam operasional?";
                }
                if (query.includes('terima kasih') || query.includes('makasih') || query.includes('thank')) {
                    return "Sama-sama! Senang bisa membantumu. Jangan sungkan bertanya lagi jika butuh info lain, ya! Tetap semangat belajarnya! 📚✨";
                }

                // 3. Intent Bertanya Jam Operasional
                if (query.includes('jam') || query.includes('buka') || query.includes('tutup') || query.includes('operasional') || query.includes('jadwal')) {
                    return "Perpustakaan **PerpusSMK** buka pada jadwal berikut:\n\n📅 **Senin - Kamis:** 07:00 - 15:00 WIB\n📅 **Jumat:** 07:00 - 11:00 WIB\n☕ *Jam Istirahat (Tutup Sementara): 12:00 - 13:00 WIB*.\n\nSilakan berkunjung di jam kerja ya!";
                }

                // 4. Intent Bertanya Aturan / Denda / Syarat Pinjam
                if (query.includes('aturan') || query.includes('tata tertib') || query.includes('denda') || query.includes('syarat') || query.includes('cara pinjam') || query.includes('berapa hari') || query.includes('sanksi')) {
                    return "Berikut tata tertib penting di **PerpusSMK**:\n\n1. Maksimal meminjam **3 buku** sekaligus.\n2. Batas waktu peminjaman adalah **7 hari**.\n3. Terlambat mengembalikan dikenakan denda administratif **Rp500/hari** per buku.\n4. Siswa wajib menjaga kebersihan dan dilarang membawa makanan/minuman ke meja baca.";
                }

                // 5. Intent Bertanya Pengelola / Pustakawan
                if (query.includes('pustakawan') || query.includes('petugas') || query.includes('pengelola') || query.includes('budiarti') || query.includes('kepala')) {
                    return "Perpustakaan PerpusSMK dikelola secara profesional oleh **Ibu Budiarti, S.I.Pust.** selaku Kepala Pustakawan Sekolah kita. Beliau sangat ramah dan siap membantumu di meja sirkulasi!";
                }

                // 6. Intent Sinopsis / Deskripsi Detail Buku
const isAskingDescription =
    query.includes('sinopsis') ||
    query.includes('isi') ||
    query.includes('jelaskan') ||
    query.includes('deskripsi') ||
    query.includes('tentang');

// Cari kecocokan buku spesifik
const matchedBook = libraryBooks.find(b => {
    return query.includes(b.title.toLowerCase()) || 
           (query.includes(' bandit') && b.id === 2) ||
           (query.includes('badai') && b.id === 3) ||
           (query.includes('branding') && b.id === 4) ||
           (query.includes('brief') && b.id === 5) ||
           (query.includes('administrasi') && b.id === 6) ||
           ((query.includes('gim') || query.includes('perangkat lunak')) && b.id === 1);
});

if (matchedBook) {
    if (isAskingDescription) {
        return `Tentu! Buku **"${matchedBook.title}"** karya *${matchedBook.author}* membahas:\n\n"${matchedBook.description}"\n\n📌 **Lokasi:** ${matchedBook.shelf}\n⚡ **Status:** ${matchedBook.status}`;
    } else {
        if (matchedBook.status === 'Tersedia') {
            return `Kabar baik! Buku **"${matchedBook.title}"** karya *${matchedBook.author}* berstatus **Tersedia**. Kamu bisa langsung mengambilnya di **${matchedBook.shelf}**.\n\nApakah kamu mau aku jelaskan sinopsis singkat isi bukunya?`;
        } else {
            const alt = libraryBooks.find(
                b => b.category === matchedBook.category && b.status === 'Tersedia'
            );

            let responseText =
                `Waduh, maaf sekali. Buku **"${matchedBook.title}"** saat ini sedang **Dipinjam**. 😢\n\n`;

            if (alt) {
                responseText +=
                    `Sebagai alternatif di kategori **${matchedBook.category}**, aku merekomendasikan buku **"${alt.title}"** (*${alt.author}*) yang berstatus **Tersedia** di **${alt.shelf}**.\n\nMau kuambilkan buku alternatifnya?`;
            } else {
                responseText +=
                    `Silakan cari buku kategori lain di tab katalog atau hubungi Ibu Budiarti untuk melakukan inden antrean buku ini.`;
            }

            return responseText;
        }
    }
}

// 7. Intent Rekomendasi
if (
    query.includes('rekomendasi') ||
    query.includes('rekomendasikan') ||
    query.includes('saran') ||
    query.includes('bagus') ||
    query.includes('populer')
) {

    if (
        query.includes('it') ||
        query.includes('gim') ||
        query.includes('coding') ||
        query.includes('pplg')
    ) {

        const book = libraryBooks.find(b => b.id === 1);

        return `Untuk kategori **IT/Pemrograman**, rekomendasi utama adalah **"${book.title}"** karya *${book.author}* di **${book.shelf}**. Membahas dasar algoritma yang sangat mudah dipahami pemula.`;
    }

    if (
        query.includes('novel') ||
        query.includes('fiksi') ||
        query.includes('cerita')
    ) {

        const book = libraryBooks.find(b => b.id === 2);

        return `Suka cerita petualangan seru? Kamu wajib membaca novel **"${book.title}"** karya *${book.author}* di **${book.shelf}**. Kisahnya sangat memotivasi dan penuh misteri menegangkan!`;
    }

    if (
        query.includes('pengembangan diri') ||
        query.includes('mental') ||
        query.includes('psikologi')
    ) {

        const book = libraryBooks.find(b => b.id === 3);

        return `Jika mencari motivasi diri, coba baca **"${book.title}"** karya *${book.author}* di **${book.shelf}**. Sangat pas untuk merenung dan mengelola kecemasan anak remaja.`;
    }

    // rekomendasi random
    const availableBooks = libraryBooks.filter(
        b => b.status === 'Tersedia'
    );

    const recommended =
        availableBooks[Math.floor(Math.random() * availableBooks.length)];

    return `Ini salah satu rekomendasi buku terbaik hari ini yang **Tersedia** untuk dipinjam:\n\n📖 **"${recommended.title}"** oleh *${recommended.author}* (${recommended.category}).\n\n**Sinopsis singkat:** ${recommended.description}\n\nKamu bisa mengambilnya langsung di **${recommended.shelf}**!`;
}

// 8. Validasi Buku Tidak Ditemukan

const foundBook = libraryBooks.find(book =>
    query.includes(book.title.toLowerCase()) ||
    query.includes(book.author.toLowerCase()) ||
    query.includes(book.category.toLowerCase())
);

// Kalau user mencari kategori umum
if (query.includes('novel')) {

    const novels = libraryBooks.filter(
        b => b.category.toLowerCase() === 'novel'
    );

    if (novels.length > 0) {

        let result = "📚 Koleksi novel yang tersedia di PerpusSMK:\n\n";

        novels.forEach((book, index) => {
            result += `${index + 1}. "${book.title}" - ${book.author} (${book.status})\n`;
        });

        return result;
    }
}

// Kalau benar-benar tidak ditemukan
if (
    (
        query.includes('buku') ||
        query.includes('novel') ||
        query.includes('cerita') ||
        query.includes('komik')
    ) &&
    !foundBook
) {

    return `Maaf 😅 Buku yang kamu cari belum tersedia di katalog PerpusSMK saat ini.\n\nSilakan coba cari judul buku lain atau buka menu **Katalog Buku** untuk melihat koleksi yang tersedia 📚`;
}

// 9. Pencarian Kategori Umum
if (
    query.includes('it') ||
    query.includes('pplg') ||
    query.includes('gim')
) {

    return `Untuk kategori **IT**, kita memiliki buku *"Dasar-Dasar Pengembangan Perangkat Lunak dan Gim"* di Rak IT-01. Buku ini sangat cocok untuk memulai dasar belajar pemrograman!`;
}

if (
    query.includes('novel') ||
    query.includes('fiksi')
) {

    return `Di kategori **Novel**, kita punya buku terlaris *"Tanah Para Bandit"* karya Tere Liye (Rak NV-01) dan buku emosional *"Manusia dan Badainya"* karya Syahid Muhammad (Rak NV-02).`;
}

// 10. Fallback Default
return "Aku mengerti pertanyaanmu seputar perpustakaan. 😊 Namun, agar jawabanku lebih akurat, bolehkah kamu sebutkan judul buku yang ingin kamu cari secara spesifik? Atau tanyakan info jam kerja, denda, dan sinopsis buku ke aku!";
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
                        <p class="text-xs text-slate-400 dark:text-slate-500 mb-2">Penulis: ${book.author}</p>
                        <p class="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-3 mb-4 italic">"${book.description}"</p>
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

        // Shortcut dari Katalog langsung menuliskan pesan ke chatbot menanyakan deskripsi & ketersediaan sekaligus
        function askBotAboutBook(title) { switchView('chat'); document.getElementById('chatInput').value = `Berikan informasi lengkap mengenai buku "${title}", termasuk sinopsis, status ketersediaan, dan lokasi raknya.`; handleSendMessage(); }

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