class UI {
    //display stories
    static displayStories(s) {
        const container = document.getElementById('myStory');
        if (!container) return;
        container.innerHTML = "";

        s.showAllStories().forEach(story => {
            const storyEl = document.createElement('div');
            storyEl.className = 'myStory';
            const avatar = UI.getAuthorAvatar(story.authorName, story.authorAvatar);
            storyEl.innerHTML = `
                <h3>${story.title}</h3>
                <p><b>By:</b> <span class="avatar">${avatar}</span> ${story.authorName}</p>
                <p>${story.content}</p>
                <small>Posted on: ${story.date} </small>
                `;
                container.appendChild(storyEl);
        });
    }
    //display the feed
    static displayFeed(feed) {
        const container = document.getElementById("posts");
        if (!container) return;
        container.innerHTML = "";

        // Show newest stories first 
        const allStories = feed.showAllStories();
        const stories = allStories.slice().reverse();

        stories.forEach(story => {
            const originalIndex = allStories.indexOf(story);
            const isBuiltIn = originalIndex >= 0 && originalIndex < 3;
            if (!isBuiltIn && !UI.isFriendOrSelf(story.authorName)) return;

            const storyEl = document.createElement('div');
            storyEl.className = 'storyPost';

            const likedStories = JSON.parse(localStorage.getItem('likedStories') || '[]');
            const liked = likedStories.includes(story.title);

            const avatar = UI.getAuthorAvatar(story.authorName, story.authorAvatar);

            storyEl.innerHTML = `
                <h3>${story.title}</h3>
                <p><b>By:</b> <span class="avatar">${avatar}</span> ${story.authorName}</p>
                <p>${story.content}</p>
                <small>Posted on: ${story.date} </small>
                `;

            // Create like button safely (avoid embedding the title into an inline onclick attribute
            // because titles may contain apostrophes). Use an event listener instead.
            const actionP = document.createElement('p');
            const likeBtn = document.createElement('button');
            likeBtn.className = 'likeBtn';
            likeBtn.textContent = liked ? '❤️' : '🤍';
            likeBtn.addEventListener('click', () => UI.toggleLike(story.title, likeBtn));
            actionP.appendChild(likeBtn);
            storyEl.appendChild(actionP);
            container.appendChild(storyEl);
        });
    }

    // Resolve an avatar for the author. Prefer an explicit avatar attached to the story
    static getAuthorAvatar(authorName, explicitAvatar) {
        if (explicitAvatar) return explicitAvatar;
        try {
            if (Array.isArray(friendList)) {
                const f = friendList.find(fr => fr.name === authorName);
                if (f && f.avatar) return f.avatar;
            }
            if (typeof currentUser === 'object' && currentUser.name === authorName && currentUser.avatar) {
                return currentUser.avatar;
            }
        } catch (e) {
            // ignore and fall through to default
        }
        return '👤';
    }

    // Check whether a story author is in the friend list or is the current user
    static isFriendOrSelf(authorName) {
        try {
            if (typeof currentUser === 'object' && currentUser.name === authorName) return true;
            if (Array.isArray(friendList)) {
                return friendList.some(f => f.name === authorName);
            }
        } catch (e) {
            // ignore
        }
        return false;
    }

    // Toggle like for a story
    static toggleLike(storyTitle, button) {
        try {
            // Get liked stories by this user
            let likedStories = JSON.parse(localStorage.getItem('likedStories') || '[]');

            if (likedStories.includes(storyTitle)) {
                // Already liked → toggle back
                likedStories = likedStories.filter(title => title !== storyTitle);
                button.textContent = '🤍';

                storyObservable.notify(`🤍 You unliked "${storyTitle}"`)
            } else {
                // Like the story
                likedStories.push(storyTitle);
                button.textContent = '❤️';

                // Notify observers
                storyObservable.notify(`❤️ You liked "${storyTitle}"!`);
            }

            localStorage.setItem('likedStories', JSON.stringify(likedStories));

        } catch (e) {
            console.error('Failed to toggle like', e);
        }
    }

    //display friends in both the homepage and parent console
    static displayFriends() {
        const friendContainer = document.getElementById('friends');
        if (!friendContainer) return;
        // Render heading inside the friends box (restore original behavior)
        friendContainer.innerHTML = '<h3>Friends</h3>';

        // Prefer persisted friend list if available so separate pages stay in sync
        let friendsToRender = null;
        try {
            const stored = localStorage.getItem('friendList');
            if (stored) friendsToRender = JSON.parse(stored);
        } catch (e) {
            console.error('Failed to parse stored friendList', e);
        }
        if (!Array.isArray(friendsToRender)) {
            if (!Array.isArray(friendList)) return;
            friendsToRender = friendList;
        }

        friendsToRender.forEach(friend => {
            const friendEl = document.createElement('div');
            friendEl.classList.add('friendCard');

            friendEl.innerHTML = `
                <span class="avatar">${friend.avatar}</span>
                <span class="friendName">${friend.name}</span>
                <span class="status ${friend.online ? 'online' : 'offline'}"></span>
            `;
            friendContainer.appendChild(friendEl);
        });
    }

    //display user profil
    static displayProfil() {
        const nameEl = document.getElementById("name");
        const ageEl = document.getElementById("age");
        const cityEl = document.getElementById("city");
        const avatarEl = document.getElementById("currentAvatar");
        const profileNameEl = document.getElementById("profileName");

        if (nameEl) nameEl.innerHTML = `<b>Name: </b>${currentUser.name}`;
        if (ageEl) ageEl.innerHTML = `<b>Age: </b>${currentUser.age} years old`;
        if (cityEl) cityEl.innerHTML = `<b>City: </b>${currentUser.city}`;
        if (avatarEl) avatarEl.textContent = currentUser.avatar;
        if (profileNameEl) profileNameEl.textContent = currentUser.name;

        // Load avatar choices
        const container = document.getElementById("avatarOptions");
        container.innerHTML = "";
        
        avatarOptions.forEach(avatar => {
            const btn = document.createElement("button");
            btn.className = "avatar-choice";
            btn.textContent = avatar;

            btn.addEventListener("click", () => {
                try {
                    // If currentUser is a UserProfile instance, use its updater (which also saves)
                    if (currentUser && typeof currentUser.updateAvatar === 'function') {
                        currentUser.updateAvatar(avatar);
                    } else if (currentUser) {
                        currentUser.avatar = avatar;
                    }
                    const curEl = document.getElementById("currentAvatar");
                    if (curEl) curEl.textContent = (currentUser && currentUser.avatar) ? currentUser.avatar : avatar;
                    console.log('Avatar changed!', avatar);
                } catch (e) {
                    console.error('Failed to change avatar', e);
                }
            });

            container.appendChild(btn);
        });

        // Render user's own published stories in the profile (if any)
        try {
            const yourStoriesEl = document.getElementById('yourStories');
            if (yourStoriesEl) {
                yourStoriesEl.innerHTML = '<h2>Your shared stories</h2>';
                yourStoriesEl.className = 'yourStory';
                const stories = (currentUser && Array.isArray(currentUser.stories)) ? currentUser.stories.slice().reverse() : [];
                if (stories.length === 0) {
                    yourStoriesEl.innerHTML += '<p>No stories yet. Share one from Create Story!</p>';
                } else {
                    stories.forEach((s, index) => {
                        const sEl = document.createElement('div');
                            sEl.className = 'profileStory';
                        const avatar = s.authorAvatar || (currentUser && currentUser.avatar) || '👤';
                        sEl.innerHTML = `
                            <button class="deleteStoryBtn" onclick="UI.deleteStory(${index})">Delete story</button>
                            <h4>${s.title}</h4>
                            <p><b>By:</b> <span class="avatar">${avatar}</span> ${s.authorName}</p>
                            <p>${s.content}</p>
                            <small>Posted on: ${s.date}</small>
                        `;
                        yourStoriesEl.appendChild(sEl);
                    });
                }
            }
        } catch (e) {
            console.error('Failed to render user stories in profile', e);
        }
    }

    // Alias with common spelling
    static displayProfile() {
        return UI.displayProfil();
    }

    //friend requests -> shown in the parent console
    static displayFriendRequests() {
        const container = document.getElementById('requestsContainer');
        if (!container) return;
        // Title is rendered outside the box in the HTML; render only the requests inside this container
        container.innerHTML = '';

        if (friendRequest.length === 0) {
            container.innerHTML = "<p>No pending requests.</p>";
            return;
        }
        container.innerHTML = "<h3>Pending Friend Requests</h3>";
        friendRequest.forEach((request, index) => {
            const requestEl = document.createElement('div');
            requestEl.className = 'friendRequest';
            requestEl.innerHTML = `
                <span><span class="avatar">${request.avatar}</span> ${request.name} wants to be friends</span>
                <button class="acceptBtn" id="reqBtn">Accept</button>
                <button class="denyBtn" id="reqBtn">Deny</button>
            `;

        requestEl.querySelector(".acceptBtn").addEventListener("click", () => {
            console.log('in accept');
            UI.handleFriendRequest(index, true);
        });

        requestEl.querySelector(".denyBtn").addEventListener("click", () => {
            UI.handleFriendRequest(index, false);
        });
            console.log('in friendRequest');
            container.appendChild(requestEl);
        });
    }

    static handleFriendRequest(index, accepted) {
        const request = friendRequest[index];
        
        if (!request) return;

        if (accepted) {
            // Move into friendList
            friendList.push({
                name: request.name,
                avatar: request.avatar,
                online: false
            });
            console.log('In handleFriendRequest if else');
            // Persist updated friend list so other pages can pick it up
            try {
                localStorage.setItem('friendList', JSON.stringify(friendList));
            } catch (e) {
                console.error('Failed to persist friendList', e);
            }

            storyObservable.notify(`🎉 ${request.name} is now a friend!`);
        } else {
            storyObservable.notify(`❌ You denied ${request.name}'s request.`);
        }

        // Remove from friendRequest list
        friendRequest.splice(index, 1);

        // Refresh parent console display
        UI.displayFriendRequests();
        UI.displayFriends()

        // Also refresh friends list if shown
        const fl = document.getElementById("friendList");
        if (fl) UI.displayFriends();
    }

    // Toggle Tommy's online status
    static toggleUserOnlineStatus() {
        try {
            // Update the current user's online status (Tommy)
            if (currentUser && typeof currentUser === 'object') {
                // Note: currentUser is a UserProfile, which doesn't have an 'online' property by default
                // We'll store this in localStorage for persistence
                let userStatus = JSON.parse(localStorage.getItem('userOnlineStatus') || '{}');
                userStatus.online = !userStatus.online;
                localStorage.setItem('userOnlineStatus', JSON.stringify(userStatus));

                // Update the status icon
                const statusIcon = document.getElementById('tommyStatusIcon');
                if (statusIcon) {
                    if (userStatus.online) {
                        statusIcon.className = 'status online';
                        storyObservable.notify(`✅ Tommy is now Online`);
                    } else {
                        statusIcon.className = 'status offline';
                        storyObservable.notify(`⛔ Tommy is now Offline`);
                    }
                }
            }
        } catch (e) {
            console.error('Failed to toggle user online status', e);
        }
    }

    // Initialize the online status button on page load
    static initializeOnlineStatusButton() {
        try {
            const statusIcon = document.getElementById('tommyStatusIcon');
            if (statusIcon) {
                const userStatus = JSON.parse(localStorage.getItem('userOnlineStatus') || '{}');
                if (userStatus.online) {
                    statusIcon.className = 'status online';
                } else {
                    statusIcon.className = 'status offline';
                }
            }
        } catch (e) {
            console.error('Failed to initialize online status button', e);
        }
    }

    // Delete a story from the user's profile and from the feed
    static deleteStory(index) {
        try {
            if (!confirm('Are you sure you want to delete this story?')) return;

            // Remove from user profile
            if (currentUser && Array.isArray(currentUser.stories)) {
                const deletedStory = currentUser.stories[index];
                currentUser.stories.splice(index, 1);
                
                // Save the updated profile
                if (typeof currentUser.saveProfile === 'function') {
                    currentUser.saveProfile();
                }

                // Remove from publishedStories in localStorage
                if (deletedStory) {
                    const published = JSON.parse(localStorage.getItem('publishedStories') || '[]');
                    const updatedPublished = published.filter(s => s.title !== deletedStory.title);
                    localStorage.setItem('publishedStories', JSON.stringify(updatedPublished));

                    // Remove from myFeed
                    const feedStories = myFeed.showAllStories();
                    const feedIndex = feedStories.findIndex(s => s.title === deletedStory.title && s.authorName === deletedStory.authorName);
                    if (feedIndex !== -1) {
                        myFeed.feed.splice(feedIndex, 1);
                    }
                }

                // Notify observers
                if (typeof storyObservable !== 'undefined' && storyObservable && typeof storyObservable.notify === 'function') {
                    storyObservable.notify(`🗑️ Story deleted successfully!`);
                }

                // Refresh the profile display
                UI.displayProfil();
            }
        } catch (e) {
            console.error('Failed to delete story', e);
        }
    }

    // Display friend search and add functionality
    static displayFriendSearch() {
        const container = document.getElementById('friendSearchContainer');
        if (!container) return;
        
        container.innerHTML = `
            <h3 id='friendSearchHeading'>Search & Add Friends</h3>   
            <div class="searchBox">
                <input type="text" id="friendSearchInput" placeholder="Search friends by name... e.g Emma, Lucas" onkeyup="UI.searchFriends()">
                <div id="searchResults"></div>
            </div>
        `;
    }

    // Search for friends that aren't already added and haven't sent requests
    static searchFriends() {
        const searchInput = document.getElementById('friendSearchInput');
        const resultsContainer = document.getElementById('searchResults');
        
        if (!searchInput || !resultsContainer) return;
        
        const searchTerm = searchInput.value.toLowerCase().trim();
        
        // Get all available friends (not currently in friendList or friendRequest)
        const currentFriendNames = friendList.map(f => f.name.toLowerCase());
        const requestNames = friendRequest.map(r => r.name.toLowerCase());
        const currentUserName = currentUser && currentUser.name ? currentUser.name.toLowerCase() : '';

        // Define all available friends that can be added
        const allAvailableFriends = [
            { name: 'Emma', avatar: '🐵' },
            { name: 'Lucas', avatar: '🐸' },
            { name: 'Ava', avatar: '🐯' },
            { name: 'Oliver', avatar: '🐶' },
            { name: 'Sophia', avatar: '🦄' },
            { name: 'Jackson', avatar: '🐉' },
            { name: 'Isabella', avatar: '🐶' },
            { name: 'Liam', avatar: '🐱' },
            { name: 'Charlotte', avatar: '🧚' },
            { name: 'Benjamin', avatar: '🐸' }
        ];

        // Filter friends based on search term and exclude already added friends or those with pending requests
        let results = allAvailableFriends.filter(friend => {
            const friendNameLower = friend.name.toLowerCase();
            const isNotInFriendList = !currentFriendNames.includes(friendNameLower);
            const isNotInRequestList = !requestNames.includes(friendNameLower);
            const isNotCurrentUser = friendNameLower !== currentUserName;
            const matchesSearch = friend.name.toLowerCase().includes(searchTerm);
            
            return isNotInFriendList && isNotInRequestList && isNotCurrentUser && matchesSearch;
        });

        resultsContainer.innerHTML = '';

        if (searchTerm === '') {
            resultsContainer.innerHTML = '<p style="color: #999; font-size: 16px;">Start typing to search for friends...</p>';
            return;
        }

        if (results.length === 0) {
            resultsContainer.innerHTML = '<p style="color: #999; font-size: 16px;">No friends found matching your search.</p>';
            return;
        }

        results.forEach(friend => {
            const resultEl = document.createElement('div');
            resultEl.className = 'searchResultItem';
            resultEl.innerHTML = `
                <div>
                    <span class="avatar">${friend.avatar}</span>
                    <span>${friend.name}</span>
                </div>
                <button class="addFriendBtn" onclick="UI.addFriendFromSearch('${friend.name}', '${friend.avatar}')">Add Friend</button>
            `;
            resultsContainer.appendChild(resultEl);
        });
    }

    // Add a friend from the search results
    static addFriendFromSearch(friendName, friendAvatar) {
        try {
            if (!friendName || !friendAvatar) return;

            // Check if already in friendList
            if (friendList.some(f => f.name === friendName)) {
                alert('This friend is already in your friend list!');
                return;
            }

            // Add to friendList
            friendList.push({
                name: friendName,
                avatar: friendAvatar,
                online: false
            });
            // Persist updated friend list so other pages can pick it up
            try {
                localStorage.setItem('friendList', JSON.stringify(friendList));
            } catch (e) {
                console.error('Failed to persist friendList', e);
            }

            // Notify observers
            if (typeof storyObservable !== 'undefined' && storyObservable && typeof storyObservable.notify === 'function') {
                storyObservable.notify(`🎉 ${friendName} has been added to your friends!`);
            }
            // Refresh displays
            UI.searchFriends(); // Clear search results
            UI.displayFriends(); // Update friends list
            document.getElementById('friendSearchInput').value = '';
            
        } catch (e) {
            console.error('Failed to add friend', e);
        }
    }
}

// Listen for friendList changes from other pages and refresh the friends UI
window.addEventListener('storage', function(e) {
    if (e.key === 'friendList') {
        try {
            // When storage changes, re-render friends in any page that loaded this script
            UI.displayFriends();
        } catch (err) {
            console.error('Failed to refresh friends on storage event', err);
        }
    }
});
