// Stores the current story being created
let currentStory = null;

//the gived friendslist
const friendList = [
    {name : 'Mia', avatar: '🦊', online: true},
    {name : 'Leo', avatar: '🐰', online: false},
    {name : 'Noah', avatar: '🐻', online: false},
    {name : 'Sofia', avatar: '🧚', online: true},
    {name : 'Max', avatar: '🐨', online: true}
];

const friendRequest = [
    {name : 'Harry', avatar: '🐯', online: false},
    {name : 'Elisabeth', avatar: '🦄', online: false},
    {name : 'Will', avatar: '🐉', online: false},     
    {name : 'Lisa', avatar: '🐹', online: false}
]


// Load profile and make it the currentUser so profile changes persist
const userProfile = UserProfile.loadProfile();
const currentUser = userProfile;

// Hardcode avatar options
const avatarOptions = ["🐱", "🐶", "🐵", "🐯", "🐸", "🧚", "🐉", "🦄"];


// Options for dynamic selector based on story type
const storyTypeSpecificOptions = {
    'Fairy Tale': {
        label: 'Magic Element',
        placeholder: 'Enter magic element (e.g., Wand, Spell, Crystal)',
        key: 'magicElement',
        options: ['🪄 Wand', '✨ Spell', '🔮 Crystal', '🧪 Potion', '📜 Enchantment']
    },
    'Adventure': {
        label: 'Location',
        placeholder: 'Enter location (e.g., Mountain, Desert, Ocean)',
        key: 'location',
        options: ['⛰️ Mountain', '🏜️ Desert', '🌊 Ocean', '🌳 Forest', '🏝️ Island']
    },
    'Bedtime Story': {
        label: 'Ending Phrase',
        placeholder: 'Enter ending phrase (e.g., Sweet dreams)',
        key: 'endingPhrase',
        options: ['😴 Good night and sweet dreams!', '🌛 Sleep tight!', '💭 Dream of wonderful things', '📚 The end... goodnight!', '🏰 And they lived happily ever after']
    }
};

// Handle story type change and update dynamic selector
function handleStoryTypeChange() {
    const storyType = document.getElementById('storyType').value;
    const container = document.getElementById('dynamicInputContainer');
    const selector = document.getElementById('storyTypeSpecific');

    if (storyType === '' || !storyTypeSpecificOptions[storyType]) {
        container.style.display = 'none';
        return;
    }

    const config = storyTypeSpecificOptions[storyType];
    container.style.display = 'block';
    selector.innerHTML = `<option value="">Choose ${config.label.toLowerCase()}</option>`;

    config.options.forEach(option => {
        const opt = document.createElement('option');
        opt.value = option;
        opt.textContent = option;
        selector.appendChild(opt);
    });
}

// generates a story based on the input
function generateStory(storyType, character, characterName, authorName, typeSpecificValue) {
    // authorName is optional here because we pick it from currentUser when creating
    if (storyType === "" || character === "" || characterName === "") {
        alert('Write in all the fields!')
        return null; // Indicate failure due to missing fields
    }

    // Title generation per story type
    let title;
    if (storyType === 'Fairy Tale') {
        title = `${characterName}'s Fairy Tale ✨`;
    } else if (storyType === 'Adventure') {
        title = `${characterName} and the Great Adventure 🌍`;
    } else if (storyType === 'Bedtime Story') {
        title = `Goodnight, ${characterName} 🌙`;
    } else {
        title = `${characterName}'s Story`;
    }

    // Function to create content with type-specific details
    function createContent() {
        if (storyType === 'Fairy Tale') {
            return `${characterName} the ${character} lived in a magical kingdom where dreams came true. One day, a sparkling
            butterfly led ${characterName} to a hidden forest of golden trees. There, a gentle wizard asked for help to
            find his lost ${typeSpecificValue ? typeSpecificValue.toLowerCase() : 'wand'}. With courage and kindness, ${characterName} searched high and low until it was found.
            From that day on, the kingdom shone even brighter, thanks to ${characterName}'s brave heart.`;
        } else if (storyType === 'Adventure') {
            return `${characterName} the ${character} loved exploring the wide, wild world beyond the hills.
            One morning, a mysterious map appeared on ${characterName}'s doorstep. Following its twists and turns,
            ${characterName} crossed rivers, climbed mountains, and arrived at the magnificent ${typeSpecificValue || 'destination'}.
            But the real treasure was the friends made along the way. ${characterName} returned home with stories
            that sparkled brighter than any gem.`;
        } else if (storyType === 'Bedtime Story') {
            return `${characterName} the ${character} watched the stars twinkle above the quiet meadow.
        Tonight felt special, like the moon was whispering a secret. With sleepy eyes, ${characterName} followed
        the soft glow of fireflies to a hidden garden of dreams. There, the stars sang a gentle song
        just for ${characterName}. Wrapped in warmth and wonder, ${characterName} drifted home and fell fast asleep with a smile. ${typeSpecificValue || 'Good night and sweet dreams!'}`;
        } else {
            return "Your story is on the way!";
        }
    }

    const content = createContent();
    return { title, content };
}

// creates the story and gives it to the user
function handleCreateStory() {
    const storyType = document.getElementById('storyType').value;
    const character = document.getElementById('characterType').value;
    const characterName = document.getElementById('characterName').value;
    // Author is taken from the current user profile
    const authorName = (typeof currentUser === 'object' && currentUser.name) ? currentUser.name : 'Anonymous';

    // Get type-specific value from the dynamic selector (safely handle if element doesn't exist)
    const typeSpecificSelector = document.getElementById('storyTypeSpecific');
    const typeSpecificValue = typeSpecificSelector ? typeSpecificSelector.value : '';

    const generated = generateStory(storyType, character, characterName, authorName, typeSpecificValue);
    if (!generated) return; // validation failed inside generateStory
    const { title, content } = generated;

    // Create story instance using factory to keep constructor logic in one place
    const storyData = { 
        title, 
        character, 
        storyType, 
        characterName, 
        authorName, 
        content, 
        authorAvatar: (currentUser && currentUser.avatar) || '👤' 
    };

    // Add type-specific property to story data
    if (storyType === 'Fairy Tale' && typeSpecificValue) {
        storyData.magicElement = typeSpecificValue;
    } else if (storyType === 'Adventure' && typeSpecificValue) {
        storyData.location = typeSpecificValue;
    } else if (storyType === 'Bedtime Story' && typeSpecificValue) {
        storyData.endingPhrase = typeSpecificValue;
    }
    const story = typeof createStoryInstance === 'function' ? createStoryInstance(storyData) : null;
    if (!story) {
        alert('Failed to create story instance.');
        return;
    }

    currentStory = story;
    // Display only the new story
    const container = document.getElementById('myStory');
    if (!container) return;
    container.innerHTML = "";
    const storyEl = document.createElement('div');
    storyEl.className = 'storyPost';
    const avatar = currentStory.authorAvatar || currentUser.avatar || '👤';
    
    storyEl.innerHTML = `
        <h3>${story.title}</h3>
        <p><b>By:</b> <span class="avatar">${avatar}</span> ${story.authorName}</p>
        <p>${story.content}</p>
        <small>Posted on: ${story.date} </small>
    `;
    container.appendChild(storyEl);
}

//Publish a story 
function handlePublishStory() {
    if (currentStory === null) {
        alert('Please create a story first!');
        return;
    }
    // Save a plain object representation to localStorage so it persists across pages
    const toSave = {
        title: currentStory.title,
        character: currentStory.character,
        storyType: currentStory.storyType,
        characterName: currentStory.characterName,
        authorName: currentStory.authorName,
        authorAvatar: currentStory.authorAvatar || currentUser.avatar,
        content: currentStory.content,
        date: currentStory.date,
        magicElement: currentStory.magicElement,
        location: currentStory.location,
        endingPhrase: currentStory.endingPhrase
    };
    const existing = JSON.parse(localStorage.getItem('publishedStories') || '[]');
    existing.push(toSave);
    localStorage.setItem('publishedStories', JSON.stringify(existing));

    // Also save the published story to the user's profile
    try {
        if (currentUser && typeof currentUser.addStory === 'function') {
            currentUser.addStory(toSave);
        } else if (currentUser && Array.isArray(currentUser.stories)) {
            currentUser.stories.push(toSave);
            if (typeof currentUser.saveProfile === 'function') currentUser.saveProfile();
        }
    } catch (e) {
        console.error('Failed to save story to user profile', e);
    }

    // Notify observers (observer.js)
    if (typeof storyObservable !== 'undefined' && storyObservable && typeof storyObservable.notify === 'function') {
        storyObservable.notify(`🎉 "${toSave.title}" has been published! ✈️`);
    }

    // Redirect to feed where saved stories will be loaded from localStorage
    setTimeout(() => {
        window.location.href = 'childrens_social.html'; 
    }, 1500);
}


// Password protection for Parental Console
const parentPassword = 'StoryPals123';

function checkPassword() {
    const passwordInput = document.getElementById('psw').value;
    
    if (passwordInput === parentPassword) {
        // Hide password protector and show content
        document.getElementById('parentalProtector').style.display = 'none';
        const parentContainer = document.getElementById('parentContainer');
        parentContainer.style.display = 'grid'; // Ensure grid layout
        document.getElementById('settingsContainer').style.display = 'block';
        
        // Display friend search, friend requests and friends
        UI.displayFriendSearch();
        UI.displayFriendRequests();
        UI.displayFriends();

        // Initialize the online status button
        UI.initializeOnlineStatusButton();
    } else {
        // Show error message
        const toastContainer = document.getElementById('toastContainer');
        const toast = document.createElement('div');
        toast.className = 'toast';
        toast.textContent = '❌ Incorrect password. Please try again.';
        toastContainer.appendChild(toast);
        
        // Clear password field
        document.getElementById('psw').value = '';
        
        // Remove toast after 2 seconds
        setTimeout(() => toast.remove(), 2000);
    }
}

// Initialize password protection on page load
function initializePasswordProtection() {
    const passwordInput = document.getElementById('psw');
    if (passwordInput) {
        passwordInput.addEventListener('keypress', function(event) {
            if (event.key === 'Enter') {
                checkPassword();
            }
        });
    }
}

document.addEventListener('DOMContentLoaded', function() {
    initializePasswordProtection();

    // Policy modal handlers
    const privacyBtn = document.getElementById('privacyPolicyBtn');
    const termsBtn = document.getElementById('termsBtn');
    const modal = document.getElementById('policyModal');
    const modalBody = document.getElementById('modalBody');
    const modalTitle = document.getElementById('modalTitle');
    const modalClose = document.getElementById('modalClose');
    const modalOverlay = document.getElementById('modalOverlay');

    function openModal(title, html) {
        if (!modal) return;
        modalTitle.textContent = title;
        modalBody.innerHTML = html;
        modal.setAttribute('aria-hidden', 'false');
        modal.classList.add('open');
    }

    function closeModal() {
        if (!modal) return;
        modal.setAttribute('aria-hidden', 'true');
        modal.classList.remove('open');
    }

    if (privacyBtn) {
        privacyBtn.addEventListener('click', () => {
            openModal('', `
                <div style="font-family: Arial, sans-serif; line-height: 1.6;">
                    <h2 style="margin-top:0;">🔒 StoryPals – Privacy Policy</h2>

                    <p>Your privacy is important to us. This Privacy Policy explains how StoryPals collects, uses, and stores information.</p>

                    <h3>1. Information We Collect</h3>
                    <ul>
                        <li>Profile details you provide (such as name, avatar, age, and city).</li>
                        <li>Stories, creative text, and settings saved by the user.</li>
                        <li>Basic app usage information for local app functionality.</li>
                    </ul>

                    <p><strong>StoryPals does not collect or share sensitive personal data</strong> and does not send information to third-party servers.</p>

                    <h3>2. How Information is Used</h3>
                    <ul>
                        <li>To enable core app features (saving stories, customizing profiles, etc.).</li>
                        <li>To personalize and enhance your experience.</li>
                        <li>To maintain stories and user information directly on the device.</li>
                    </ul>

                    <h3>3. Local Storage</h3>
                    <p>All user data is stored <strong>locally on your device only</strong>.  
                    No server transmission takes place unless stated otherwise.</p>

                    <h3>4. Security</h3>
                    <p>We aim to protect your data using standard methods, but no system is completely secure.</p>

                    <h3>5. Children’s Privacy</h3>
                    <p>
                        StoryPals is built for children and families.  
                        We recommend that parents supervise account setup and story creation.
                    </p>

                    <h3>6. Changes to the Policy</h3>
                    <p>
                        We may update this Privacy Policy at any time. Continued use of the app means you accept the updated terms.
                    </p>

                    <h3>7. Contact</h3>
                    <p>
                        For questions about this privacy policy, please contact the StoryPals development team.
                    </p>
                </div>
            `);  
        });
    }

    if (termsBtn) {
        termsBtn.addEventListener('click', () => {
            openModal('', `
                <div style="font-family: Arial, sans-serif; line-height: 1.6;">
                    <h2 style="margin-top:0;">📘 StoryPals – Terms & Conditions</h2>

                    <p>
                        By using StoryPals, you agree to the following terms.
                        These terms apply to the demo version of the application.
                    </p>

                    <h3>1. Intended Use</h3>
                    <p>
                        StoryPals is a creative storytelling application designed for learning,
                        entertainment, and family use.
                    </p>

                    <h3>2. User Responsibilities</h3>
                    <ul>
                        <li>Be respectful and kind when creating or sharing stories.</li>
                        <li>Use the app in a safe and appropriate manner.</li>
                        <li>Parents are encouraged to guide younger users.</li>
                    </ul>

                    <h3>3. Data Storage</h3>
                    <p>
                        This demo application stores all content locally inside the browser and
                        does not transmit data to external servers.
                    </p>

                    <h3>4. No Legal Liability</h3>
                    <p>
                        This is a demonstration project.  
                        StoryPals offers no guarantee of uptime, performance, or data safety.
                    </p>

                    <h3>5. Changes to Terms</h3>
                    <p>
                        Terms may change without notice. Continued use means acceptance of updates.
                    </p>
                </div>
            `);
        });
    }

    if (modalClose) modalClose.addEventListener('click', closeModal);
    if (modalOverlay) modalOverlay.addEventListener('click', closeModal);

    // Close modal with Escape
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') closeModal();
    });
});
