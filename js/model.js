//superclass for stories
class Story {
    constructor(title, character, storyType, characterName, authorName, content, date = null) {
        this.title = title
        this.character = character;
        this.storyType = storyType;
        this.characterName = characterName;
        this.authorName = authorName;
        this.content = content;
        this.date = date || new Date().toLocaleDateString();

        this.StoryItem = `${this.storyType} title: ${this.title} ${this.character} by (${this.authorName}, ${this.date})`;

        this.stories = [];
    }
    showDetails() {
        console.log('Here is the story elements ', this.StoryItem);
        return this.Story;
    }
    addStory(s) {
        this.stories.push(s)
    }
}
// subclass for different types of stories
class FairyTalesStory extends Story {
    constructor(title, character, storyType, characterName, authorName, content, magicElement, date = null) {
        super(title, character, storyType, characterName, authorName, content, date);
        this.magicElement = magicElement;
        this.storyType = 'Fairy Tale';
    }
    showDetails() {
    return `${super.showDetails()} ✨ (Magic: ${this.magicElement})`;
  }
}

class AdventureStory extends Story {
    constructor(title, character, storyType, characterName, authorName, content, location, date = null) {
        super(title, character, storyType, characterName, authorName, content, date);
        this.location = location;
        this.storyType = 'Adventure';
    }
    showDetails() {
    return `${super.showDetails()} 🌍 (Adventure at: ${this.location})`;
  }
}

class BedtimeStory extends Story {
    constructor(title, character, storyType, characterName, authorName, content, endingPhrase, date = null) {
        super(title, character, storyType, characterName, authorName, content, date);
        this.endingPhrase = endingPhrase || "Good night and sweet dreams!";
        this.storyType = 'Bedtime Story';
    }
    showDetails() {
    return `${super.showDetails()} 🌙 (Ends with: ${this.endingPhrase})`;
  }
}

class StoryFeed {
    constructor() {
        this.feed = [];
    }
    showDetails() {
        console.log('Here is the story elements ', this.StoryItem);
        return this.Story;
    }
    addStory(s) {
        this.feed.push(s);
    }
    deleteStory(index) {
        this.feeed.splice(index, 1);
    }
    showAllStories() {
        return this.feed;
    }
}

const myFeed = new StoryFeed(); 

let story1 = new AdventureStory(
  "The Lost Treasure 🗺️💰",
  "Explorer",
  "Adventure",
  "Leo the Explorer",
  "Max",
  "Deep in the jungle, Leo the Explorer and his best friend Max trekked through the thick vines of the Amazon rainforest. Suddenly, they stumbled upon a hidden cave covered in glowing symbols. Inside, a gentle breeze revealed an old chest filled with golden coins and sparkling gems. But instead of keeping it, Leo decided the treasure belonged to the forest and left it safe with the animals. As the sun set, the two friends smiled, knowing their greatest treasure was the adventure itself.",
  "Amazon rainforest",
  "15.11.2025"
);

let story2 = new BedtimeStory(
  "The Sleepy Dragon 🐉🌙",
  "Draco",
  "Bedtime Story",
  "Draco",
  "Sofia",
  "Once upon a time, there was a little dragon named Draco who couldn't fall asleep no matter how hard he tried. The stars twinkled above, whispering lullabies to help him drift away. His friend Leo the explorer told him stories of calm forests and soft moonlight to soothe his tired wings. The gentle wind rocked the mountains like a cradle, and Draco's eyes grew heavier with each yawn. The dragon yawned one last time and fell fast asleep. Good night! 🌙",
  "The dragon yawned one last time and fell fast asleep. Good night!",
  "16.11.2025"
);

let story3 = new FairyTalesStory(
  "The Brave Princess 👸 ",
  "Princess",
  "Fairy Tale",
  "Princess Ella",
  "Mia",
  "Princess Ella lived in a shimmering kingdom where every flower could sing and every animal could talk. One sunny morning, her best friend Mia the rabbit came hopping in, worried that the forest had fallen silent. Without hesitation, the brave princess rode her horse into the woods to find out what was wrong. With help from the talking animals, a wise owl and a tiny mouse, Ella discovered a lost spell that had quieted the trees. She gently lifted the spell with her kindness, and soon the forest burst into joyful song once more.",
  "Talking animals",
  "17.11.2025"
);


myFeed.addStory(story1);
myFeed.addStory(story2);
myFeed.addStory(story3);

console.log(myFeed.showAllStories());
console.log(story1.showDetails())
// Factory to create a Story (or appropriate subclass) from plain data
function createStoryInstance(data) {
    if (!data) return null;
    const {
        title = '',
        character = '',
        storyType = '',
        characterName = '',
        authorName = currentUser.name,
            authorAvatar,
        content = '',
        magicElement,
        location,
        endingPhrase,
        date
    } = data;

    let instance;
    if (storyType === 'Fairy Tale') {
        instance = new FairyTalesStory(title, character, storyType, characterName, authorName, content, magicElement, date);
    } else if (storyType === 'Adventure') {
        instance = new AdventureStory(title, character, storyType, characterName, authorName, content, location, date);
    } else if (storyType === 'Bedtime Story') {
        instance = new BedtimeStory(title, character, storyType, characterName, authorName, content, endingPhrase, date);
    } else {
        instance = new Story(title, character, storyType, characterName, authorName, content, date);
    }
    // Preserve explicit avatar if provided
    if (authorAvatar) instance.authorAvatar = authorAvatar;
    return instance;
}

// Load any published stories saved in localStorage and add them to the feed
try {
    const saved = JSON.parse(localStorage.getItem('publishedStories') || '[]');
    saved.forEach(s => {
        const added = createStoryInstance(s);
        if (added) myFeed.addStory(added);
    });
} catch (e) {
    console.error('Failed to load published stories from localStorage', e);
}

// user profile model (includes persisted stories)
class UserProfile {
    constructor(name = "New User", age = 0, city = "", avatar = "🐯", stories = []) {
        this.name = 'Tommy';
        this.age = 7;
        this.city = 'Oslo';
        this.avatar = avatar;
        // stories is an array of plain story objects saved by the user
        this.stories = Array.isArray(stories) ? stories : [];
    }
    updateAvatar(newAvatar) {
        this.avatar = newAvatar;
        this.saveProfile();
    }
    updateInfo(name, age, city) {
        this.name = name;
        this.age = age;
        this.city = city;
        this.saveProfile();
    }
    addStory(storyObject) {
        try {
            this.stories.push(storyObject);
            this.saveProfile();
        } catch (e) {
            console.error('Failed to add story to profile', e);
        }
    }
    saveProfile() {
        // Only store plain data
        const toSave = {
            name: this.name,
            age: this.age,
            city: this.city,
            avatar: this.avatar,
            stories: this.stories
        };
        localStorage.setItem("storyPalsProfile", JSON.stringify(toSave));
    }

    static loadProfile() {
        const saved = localStorage.getItem("storyPalsProfile");
        if (saved) {
            const p = JSON.parse(saved);
            return new UserProfile(p.name, p.age, p.city, p.avatar, p.stories || []);
        }
        return new UserProfile();
    }
}
