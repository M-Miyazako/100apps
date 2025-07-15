// Name Generator App - Comprehensive name data and generation algorithms

class NameGenerator {
    constructor() {
        this.favorites = JSON.parse(localStorage.getItem('nameGenFavorites') || '[]');
        this.initializeData();
        this.initializeElements();
        this.setupEventListeners();
        this.updateFavoritesList();
        this.updateActionButtons();
    }

    initializeData() {
        // First names by gender and culture
        this.firstNames = {
            male: {
                english: ['Alexander', 'Benjamin', 'Christopher', 'David', 'Edward', 'Frederick', 'George', 'Henry', 'Isaac', 'James', 'Kenneth', 'Louis', 'Michael', 'Nicholas', 'Oliver', 'Patrick', 'Quincy', 'Robert', 'Samuel', 'Thomas', 'Victor', 'William', 'Xavier', 'Zachary'],
                spanish: ['Alejandro', 'Carlos', 'Diego', 'Eduardo', 'Fernando', 'Gabriel', 'Héctor', 'Ignacio', 'Javier', 'Luis', 'Manuel', 'Nicolás', 'Óscar', 'Pablo', 'Rafael', 'Sebastián', 'Tomás', 'Vicente'],
                french: ['Alexandre', 'Baptiste', 'Charles', 'Damien', 'Étienne', 'François', 'Guillaume', 'Henri', 'Julien', 'Laurent', 'Mathieu', 'Nicolas', 'Olivier', 'Pierre', 'Quentin', 'Romain', 'Sébastien', 'Théo'],
                german: ['Alexander', 'Benjamin', 'Christian', 'Daniel', 'Erik', 'Felix', 'Gustav', 'Heinrich', 'Johann', 'Klaus', 'Ludwig', 'Matthias', 'Niklas', 'Otto', 'Peter', 'Rudolf', 'Stefan', 'Thomas'],
                italian: ['Alessandro', 'Bruno', 'Carlo', 'Dante', 'Enzo', 'Franco', 'Giuseppe', 'Lorenzo', 'Marco', 'Nicolò', 'Paolo', 'Roberto', 'Stefano', 'Tommaso', 'Umberto', 'Vincenzo'],
                japanese: ['Akira', 'Hiroshi', 'Kenji', 'Makoto', 'Noboru', 'Osamu', 'Ryōta', 'Satoshi', 'Takeshi', 'Yuki', 'Daiki', 'Haruto', 'Ren', 'Sota', 'Yuto'],
                chinese: ['Wei', 'Ming', 'Jun', 'Hao', 'Qiang', 'Lei', 'Tao', 'Cheng', 'Yang', 'Bin', 'Feng', 'Gang', 'Hui', 'Jian', 'Kai'],
                arabic: ['Ahmed', 'Ali', 'Hassan', 'Hussein', 'Ibrahim', 'Khalid', 'Mohammed', 'Omar', 'Rashid', 'Saeed', 'Tariq', 'Waleed', 'Yusuf', 'Zaid'],
                russian: ['Alexander', 'Alexei', 'Andrei', 'Boris', 'Dmitri', 'Igor', 'Ivan', 'Mikhail', 'Nikolai', 'Pavel', 'Sergei', 'Viktor', 'Vladimir', 'Yuri'],
                irish: ['Aidan', 'Brendan', 'Cian', 'Declan', 'Eoin', 'Fionn', 'Liam', 'Niall', 'Oisín', 'Padraig', 'Ruairi', 'Seamus', 'Tadhg']
            },
            female: {
                english: ['Alice', 'Beatrice', 'Charlotte', 'Diana', 'Elizabeth', 'Fiona', 'Grace', 'Hannah', 'Isabella', 'Jessica', 'Katherine', 'Lucy', 'Margaret', 'Natalie', 'Olivia', 'Penelope', 'Rose', 'Sophia', 'Victoria', 'Zoe'],
                spanish: ['Alejandra', 'Beatriz', 'Carmen', 'Diana', 'Elena', 'Fernanda', 'Gabriela', 'Isabel', 'Juana', 'Lucía', 'María', 'Natalia', 'Paloma', 'Rosa', 'Sofía', 'Teresa', 'Valeria'],
                french: ['Amélie', 'Béatrice', 'Camille', 'Delphine', 'Élise', 'Françoise', 'Geneviève', 'Hélène', 'Isabelle', 'Juliette', 'Louise', 'Marie', 'Nathalie', 'Océane', 'Pauline', 'Sylvie'],
                german: ['Anna', 'Birgit', 'Claudia', 'Daniela', 'Emma', 'Franziska', 'Greta', 'Hannah', 'Ingrid', 'Julia', 'Katharina', 'Lena', 'Maria', 'Nina', 'Petra', 'Sabine', 'Ursula'],
                italian: ['Alessandra', 'Beatrice', 'Chiara', 'Daniela', 'Elena', 'Francesca', 'Giulia', 'Isabella', 'Laura', 'Maria', 'Nicoletta', 'Paola', 'Roberta', 'Silvia', 'Valentina'],
                japanese: ['Akiko', 'Emiko', 'Hiroko', 'Keiko', 'Mariko', 'Naoko', 'Sachiko', 'Takako', 'Yuki', 'Aoi', 'Hana', 'Mei', 'Rin', 'Sakura', 'Yui'],
                chinese: ['Li', 'Wang', 'Zhang', 'Liu', 'Chen', 'Yang', 'Huang', 'Zhao', 'Wu', 'Zhou', 'Xu', 'Sun', 'Ma', 'Zhu', 'Hu'],
                arabic: ['Aisha', 'Fatima', 'Khadija', 'Layla', 'Mariam', 'Nadia', 'Rahma', 'Sahra', 'Yasmin', 'Zahra', 'Amina', 'Hala', 'Iman', 'Noor'],
                russian: ['Anastasia', 'Elena', 'Irina', 'Katarina', 'Ludmila', 'Maria', 'Natasha', 'Olga', 'Polina', 'Svetlana', 'Tatiana', 'Valentina', 'Vera', 'Yelena'],
                irish: ['Aoife', 'Brigid', 'Ciara', 'Deirdre', 'Fiona', 'Gráinne', 'Maeve', 'Niamh', 'Orla', 'Róisín', 'Sinead', 'Úna']
            },
            unisex: {
                english: ['Alex', 'Blake', 'Cameron', 'Drew', 'Emery', 'Finley', 'Grey', 'Harper', 'Jordan', 'Kelly', 'Logan', 'Morgan', 'Parker', 'Quinn', 'Riley', 'Sage', 'Taylor', 'Avery'],
                spanish: ['Adrián', 'Camilo', 'Guadalupe', 'Jesús', 'Lucía', 'María José', 'Patricio', 'Renata', 'Sebastián', 'Trinidad'],
                french: ['Camille', 'Claude', 'Dominique', 'Maxime', 'Océane', 'Sacha', 'Stéphane', 'Yann'],
                german: ['Chris', 'Kim', 'Luca', 'Niki', 'Robin', 'Sascha', 'Toni'],
                italian: ['Andrea', 'Celeste', 'Gioia', 'Sole', 'Vinci'],
                japanese: ['Akira', 'Haru', 'Izumi', 'Kei', 'Michi', 'Nao', 'Sora', 'Yuki'],
                chinese: ['An', 'Jing', 'Jun', 'Ping', 'Qing', 'Rui', 'Tian', 'Xin'],
                arabic: ['Nour', 'Rami', 'Salam', 'Taha', 'Yara'],
                russian: ['Nikita', 'Sasha', 'Valya', 'Zhenya'],
                irish: ['Aiden', 'Casey', 'Kiran', 'Reilly', 'Rowan']
            }
        };

        // Last names by culture
        this.lastNames = {
            english: ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Miller', 'Davis', 'Garcia', 'Rodriguez', 'Wilson', 'Martinez', 'Anderson', 'Taylor', 'Thomas', 'Hernandez', 'Moore', 'Martin', 'Jackson', 'Thompson', 'White', 'Lopez', 'Lee', 'Gonzalez', 'Harris', 'Clark', 'Lewis', 'Robinson', 'Walker', 'Perez', 'Hall'],
            spanish: ['García', 'Rodríguez', 'González', 'Fernández', 'López', 'Martínez', 'Sánchez', 'Pérez', 'Gómez', 'Martín', 'Jiménez', 'Ruiz', 'Hernández', 'Díaz', 'Moreno', 'Álvarez', 'Muñoz', 'Romero', 'Alonso', 'Gutiérrez'],
            french: ['Martin', 'Bernard', 'Thomas', 'Petit', 'Robert', 'Richard', 'Durand', 'Dubois', 'Moreau', 'Laurent', 'Simon', 'Michel', 'Lefebvre', 'Leroy', 'Roux', 'David', 'Bertrand', 'Morel', 'Fournier', 'Girard'],
            german: ['Müller', 'Schmidt', 'Schneider', 'Fischer', 'Weber', 'Meyer', 'Wagner', 'Becker', 'Schulz', 'Hoffmann', 'Schäfer', 'Koch', 'Bauer', 'Richter', 'Klein', 'Wolf', 'Schröder', 'Neumann', 'Schwarz', 'Zimmermann'],
            italian: ['Rossi', 'Russo', 'Ferrari', 'Esposito', 'Bianchi', 'Romano', 'Colombo', 'Ricci', 'Marino', 'Greco', 'Bruno', 'Gallo', 'Conti', 'De Luca', 'Mancini', 'Costa', 'Giordano', 'Rizzo', 'Lombardi', 'Moretti'],
            japanese: ['Sato', 'Suzuki', 'Takahashi', 'Tanaka', 'Watanabe', 'Ito', 'Yamamoto', 'Nakamura', 'Kobayashi', 'Kato', 'Yoshida', 'Yamada', 'Sasaki', 'Yamaguchi', 'Saito', 'Matsumoto', 'Inoue', 'Kimura', 'Hayashi', 'Shimizu'],
            chinese: ['Wang', 'Li', 'Zhang', 'Liu', 'Chen', 'Yang', 'Huang', 'Zhao', 'Wu', 'Zhou', 'Xu', 'Sun', 'Ma', 'Zhu', 'Hu', 'Guo', 'He', 'Gao', 'Lin', 'Luo'],
            arabic: ['Al-Ahmad', 'Al-Mohammed', 'Al-Ali', 'Al-Hassan', 'Al-Hussein', 'Al-Ibrahim', 'Al-Khalil', 'Al-Omar', 'Al-Rashid', 'Al-Saeed', 'Al-Tariq', 'Al-Waleed', 'Al-Yusuf', 'Al-Zaid', 'Bin-Abdullah', 'Bin-Khalid', 'Bin-Mohammed', 'Bin-Omar', 'Bin-Rashid', 'Bin-Saeed'],
            russian: ['Ivanov', 'Petrov', 'Sidorov', 'Smirnov', 'Kuznetsov', 'Popov', 'Sokolov', 'Lebedev', 'Kozlov', 'Novikov', 'Morozov', 'Petrov', 'Volkov', 'Solovyov', 'Vasiliev', 'Zaitsev', 'Pavlov', 'Semenov', 'Golubev', 'Vinogradov'],
            irish: ['Murphy', 'Kelly', 'Sullivan', 'Walsh', 'Smith', 'Brien', 'Byrne', 'Ryan', 'Connor', 'Regan', 'Doyle', 'McCarthy', 'Gallagher', 'Doherty', 'Kennedy', 'Lynch', 'Murray', 'Quinn', 'Moore', 'McLaughlin']
        };

        // Middle names
        this.middleNames = {
            english: ['James', 'John', 'Robert', 'Michael', 'William', 'David', 'Richard', 'Joseph', 'Thomas', 'Christopher', 'Charles', 'Daniel', 'Matthew', 'Anthony', 'Mark', 'Donald', 'Steven', 'Edward', 'Kenneth', 'Paul', 'Marie', 'Rose', 'Ann', 'Jane', 'Elizabeth', 'Grace', 'Claire', 'Louise', 'May', 'Catherine'],
            spanish: ['José', 'María', 'Antonio', 'Francisco', 'Manuel', 'David', 'Juan', 'Daniel', 'Carlos', 'Miguel', 'Rafael', 'Pedro', 'Ángel', 'Alejandro', 'Diego', 'Fernanda', 'Sofía', 'Camila', 'Valentina', 'Isabella'],
            french: ['Marie', 'Pierre', 'Jean', 'Michel', 'Philippe', 'Alain', 'Bernard', 'André', 'Claude', 'Paul', 'Anne', 'Christine', 'Françoise', 'Monique', 'Catherine', 'Isabelle', 'Sylvie', 'Brigitte', 'Martine', 'Hélène'],
            german: ['Maria', 'Hans', 'Peter', 'Wolfgang', 'Klaus', 'Manfred', 'Jürgen', 'Michael', 'Helmut', 'Günter', 'Anna', 'Ursula', 'Elisabeth', 'Ingrid', 'Helga', 'Renate', 'Christa', 'Gisela', 'Monika', 'Karin'],
            italian: ['Maria', 'Giuseppe', 'Antonio', 'Francesco', 'Giovanni', 'Luigi', 'Angelo', 'Vincenzo', 'Pietro', 'Salvatore', 'Anna', 'Rosa', 'Giuseppina', 'Angela', 'Giovanna', 'Teresa', 'Lucia', 'Carmela', 'Caterina', 'Antonietta']
        };

        // Fantasy names
        this.fantasyNames = {
            elf: {
                male: ['Aerdrie', 'Berrian', 'Dayereth', 'Enna', 'Galinndan', 'Hadarai', 'Immeral', 'Ivellios', 'Laucian', 'Mindartis', 'Naal', 'Nutae', 'Paelynn', 'Peren', 'Quarion', 'Riardon', 'Rolen', 'Silvyr', 'Suhnab', 'Thamior', 'Theriatis', 'Theriovan', 'Vanuath', 'Varis'],
                female: ['Adrie', 'Althaea', 'Anastrianna', 'Andraste', 'Antinua', 'Bethrynna', 'Birel', 'Caelynn', 'Dara', 'Enna', 'Galinndan', 'Hadarai', 'Halimath', 'Heian', 'Heirann', 'Igme', 'Ivellios', 'Korfel', 'Lamlis', 'Laucian', 'Mindartis', 'Naal', 'Nutae', 'Paelynn']
            },
            dwarf: {
                male: ['Adrik', 'Alberich', 'Baern', 'Barendd', 'Brottor', 'Bruenor', 'Dain', 'Darrak', 'Delg', 'Eberk', 'Einkil', 'Fargrim', 'Flint', 'Gardain', 'Harbek', 'Kildrak', 'Morgran', 'Orsik', 'Oskar', 'Rangrim', 'Rurik', 'Taklinn', 'Thoradin', 'Thorek', 'Tordek', 'Traubon', 'Travok', 'Ulfgar', 'Veit', 'Vondal'],
                female: ['Amber', 'Artin', 'Audhild', 'Bardryn', 'Diesa', 'Eldeth', 'Gunnloda', 'Gyre', 'Helja', 'Hlin', 'Kathra', 'Kristryd', 'Ilde', 'Liftrasa', 'Mardred', 'Riswynn', 'Sannl', 'Torbera', 'Torgga', 'Vistra']
            },
            orc: {
                male: ['Dench', 'Feng', 'Gell', 'Henk', 'Holg', 'Imsh', 'Keth', 'Krusk', 'Mhurren', 'Ront', 'Shump', 'Thokk', 'Ugarth', 'Vrag', 'Yurk', 'Zorsk'],
                female: ['Baggi', 'Emen', 'Engong', 'Kansif', 'Myev', 'Neega', 'Ovak', 'Ownka', 'Shautha', 'Sutha', 'Vola', 'Volen', 'Yevelda']
            },
            human: {
                male: ['Aseir', 'Bardeid', 'Haseid', 'Khemed', 'Mehmen', 'Sudeiman', 'Zasheir', 'Darvin', 'Dorn', 'Evendur', 'Gorstag', 'Grim', 'Helm', 'Malark', 'Morn', 'Randal', 'Stedd', 'Borivik', 'Faurgar', 'Jandar', 'Kanithar', 'Madislak', 'Ralmevik', 'Shaumar', 'Vladislak'],
                female: ['Atala', 'Ceidil', 'Hama', 'Jasmal', 'Meilil', 'Seipora', 'Yasheira', 'Zasheida', 'Arveene', 'Esvele', 'Jhessail', 'Kerri', 'Lureene', 'Miri', 'Rowan', 'Shandri', 'Tessele', 'Alethra', 'Kara', 'Katernin', 'Mara', 'Natali', 'Olma', 'Tana', 'Zora']
            },
            dragon: ['Aasterinian', 'Bahamut', 'Chronepsis', 'Falazure', 'Io', 'Sardior', 'Tiamat', 'Astilabor', 'Garyx', 'Hlal', 'Lendys', 'Null', 'Task', 'Tamara', 'Zorquan', 'Aerdrie', 'Faenya', 'Angharradh', 'Corellon', 'Larethian', 'Deep', 'Duerra', 'Laduguer', 'Vergadain'],
            wizard: ['Gandalf', 'Merlin', 'Albus', 'Radagast', 'Saruman', 'Elminster', 'Raistlin', 'Fizban', 'Mordenkainen', 'Tenser', 'Bigby', 'Otiluke', 'Melf', 'Drawmij', 'Nystul', 'Rary', 'Serten', 'Snilloc', 'Tasha', 'Zagyg', 'Alaric', 'Boccob', 'Celestian', 'Delleb', 'Fharlanghn'],
            kingdom: ['Aethermoor', 'Brightlands', 'Celestria', 'Drakmoor', 'Elderwood', 'Frostholm', 'Goldenvale', 'Ironhold', 'Moonhaven', 'Shadowmere', 'Stormwind', 'Sunspear', 'Thornwick', 'Valdemar', 'Westmarch', 'Zephyria'],
            city: ['Alderheart', 'Bluewater', 'Crescent Bay', 'Dawnport', 'Emberfall', 'Frostgate', 'Goldbrook', 'Ironforge', 'Moonbridge', 'Shadowfell', 'Silverstone', 'Stormhold', 'Sunhaven', 'Thorndale', 'Willowbrook', 'Winterhold']
        };

        // Business name components
        this.businessNames = {
            prefixes: {
                tech: ['Alpha', 'Beta', 'Cyber', 'Data', 'Digital', 'Quantum', 'Smart', 'Tech', 'Virtual', 'Cloud', 'Neo', 'Flux', 'Byte', 'Code', 'Core', 'Mesh', 'Link', 'Node', 'Spark', 'Wave'],
                retail: ['Prime', 'Elite', 'Premium', 'Grand', 'Royal', 'Golden', 'Silver', 'Diamond', 'Platinum', 'Crystal', 'Elegant', 'Luxe', 'Classic', 'Modern', 'Urban', 'Global', 'Metro', 'Central', 'Express', 'Swift'],
                food: ['Fresh', 'Organic', 'Garden', 'Farm', 'Hearty', 'Tasty', 'Savory', 'Spice', 'Flavor', 'Gourmet', 'Artisan', 'Craft', 'Home', 'Kitchen', 'Bistro', 'Cafe', 'Deli', 'Market', 'Corner', 'Street'],
                consulting: ['Strategic', 'Professional', 'Expert', 'Premier', 'Advanced', 'Innovative', 'Solution', 'Optimal', 'Peak', 'Summit', 'Pinnacle', 'Apex', 'Elite', 'Prime', 'Core', 'Focus', 'Insight', 'Vision', 'Impact', 'Edge'],
                creative: ['Creative', 'Design', 'Art', 'Studio', 'Vision', 'Concept', 'Inspire', 'Imagine', 'Dream', 'Color', 'Pixel', 'Canvas', 'Brush', 'Palette', 'Craft', 'Make', 'Build', 'Form', 'Shape', 'Style'],
                healthcare: ['Health', 'Care', 'Medical', 'Wellness', 'Vital', 'Life', 'Healing', 'Recovery', 'Restore', 'Renew', 'Balance', 'Harmony', 'Pure', 'Natural', 'Holistic', 'Complete', 'Total', 'First', 'Advanced', 'Modern'],
                finance: ['Capital', 'Asset', 'Equity', 'Investment', 'Financial', 'Wealth', 'Trust', 'Secure', 'Stable', 'Solid', 'Strong', 'Reliable', 'Premier', 'Elite', 'Progressive', 'Dynamic', 'Strategic', 'Global', 'United', 'First'],
                education: ['Learning', 'Knowledge', 'Academy', 'Scholar', 'Bright', 'Smart', 'Wise', 'Skill', 'Growth', 'Progress', 'Advance', 'Excel', 'Master', 'Expert', 'Pro', 'Elite', 'Premier', 'Quality', 'Excellence', 'Success']
            },
            suffixes: {
                tech: ['Tech', 'Systems', 'Solutions', 'Labs', 'Works', 'Soft', 'Ware', 'Data', 'Logic', 'Code', 'Byte', 'Net', 'Web', 'App', 'Digital', 'Cloud', 'AI', 'Analytics', 'Platform', 'Hub'],
                retail: ['Store', 'Shop', 'Market', 'Mall', 'Plaza', 'Center', 'Outlet', 'Emporium', 'Boutique', 'Gallery', 'House', 'Place', 'World', 'Zone', 'Point', 'Station', 'Corner', 'Square', 'Street', 'Avenue'],
                food: ['Kitchen', 'Cafe', 'Bistro', 'Restaurant', 'Grill', 'Bar', 'Pub', 'Diner', 'Eatery', 'Table', 'Place', 'House', 'Room', 'Corner', 'Garden', 'Farm', 'Market', 'Fresh', 'Foods', 'Catering'],
                consulting: ['Consulting', 'Advisory', 'Services', 'Solutions', 'Partners', 'Associates', 'Group', 'Firm', 'Corporation', 'Company', 'Advisors', 'Experts', 'Professionals', 'Specialists', 'Consultants', 'Resources', 'Strategies', 'Insights', 'Analytics', 'Intelligence'],
                creative: ['Design', 'Studio', 'Creative', 'Agency', 'Arts', 'Media', 'Graphics', 'Visual', 'Digital', 'Marketing', 'Brand', 'Identity', 'Image', 'Style', 'Form', 'Concept', 'Vision', 'Ideas', 'Works', 'Lab'],
                healthcare: ['Health', 'Care', 'Medical', 'Clinic', 'Center', 'Hospital', 'Wellness', 'Therapy', 'Treatment', 'Healing', 'Recovery', 'Rehabilitation', 'Services', 'Practice', 'Group', 'Associates', 'Partners', 'Institute', 'Foundation', 'Organization'],
                finance: ['Financial', 'Capital', 'Investment', 'Wealth', 'Asset', 'Fund', 'Trust', 'Bank', 'Credit', 'Finance', 'Money', 'Securities', 'Holdings', 'Management', 'Services', 'Group', 'Partners', 'Associates', 'Corporation', 'Company'],
                education: ['Education', 'Learning', 'Academy', 'Institute', 'School', 'College', 'University', 'Training', 'Development', 'Skills', 'Knowledge', 'Wisdom', 'Growth', 'Progress', 'Excellence', 'Success', 'Achievement', 'Mastery', 'Expertise', 'Solutions']
            }
        };

        // Business suffixes
        this.businessSuffixes = ['LLC', 'Inc', 'Corp', 'Ltd', 'Co', 'Group', 'Associates', 'Partners', 'Enterprises', 'Solutions', 'Services', 'Systems', 'Technologies', 'Industries', 'Holdings', 'Ventures', 'Capital', 'Management', 'Consulting', 'International'];

        // Nickname categories
        this.nicknames = {
            cute: ['Sweetie', 'Honey', 'Darling', 'Angel', 'Pumpkin', 'Sunshine', 'Buttercup', 'Cupcake', 'Snuggles', 'Cuddles', 'Muffin', 'Cookie', 'Sugar', 'Peach', 'Cherry', 'Bunny', 'Kitten', 'Puppy', 'Teddy', 'Dimples', 'Sparkles', 'Giggles', 'Bubbles', 'Twinkles', 'Jellybean'],
            cool: ['Ace', 'Blaze', 'Dash', 'Edge', 'Flash', 'Hawk', 'Ice', 'Jet', 'Knight', 'Lightning', 'Maverick', 'Neo', 'Phoenix', 'Rebel', 'Shadow', 'Storm', 'Thunder', 'Viper', 'Wolf', 'Zephyr', 'Raven', 'Frost', 'Steel', 'Blade', 'Hunter'],
            funny: ['Goofball', 'Chuckles', 'Giggles', 'Clumsy', 'Wobbles', 'Butterfingers', 'Sleepy', 'Sneezy', 'Grumpy', 'Dopey', 'Shorty', 'Stretch', 'Bigfoot', 'Tiny', 'Peanut', 'Squirt', 'Beans', 'Noodle', 'Pickle', 'Cheese', 'Banana', 'Taco', 'Pancake', 'Waffle', 'Meatball'],
            tough: ['Tank', 'Crusher', 'Bulldozer', 'Hammer', 'Spike', 'Razor', 'Bruiser', 'Titan', 'Rambo', 'Hulk', 'Beast', 'Savage', 'Warrior', 'Gladiator', 'Destroyer', 'Terminator', 'Annihilator', 'Demolisher', 'Wrecker', 'Smasher', 'Brawler', 'Fighter', 'Boxer', 'Slugger', 'Knockout'],
            gamer: ['Ninja', 'Sniper', 'Phantom', 'Ghost', 'Hacker', 'Cyborg', 'Matrix', 'Pixel', 'Gamer', 'Player', 'Noob', 'Pro', 'Elite', 'Legend', 'Master', 'Chief', 'Captain', 'Commander', 'General', 'Admiral', 'Dragon', 'Phoenix', 'Vortex', 'Nexus', 'Apex'],
            short: ['Al', 'Ben', 'Dan', 'Ed', 'Flo', 'Gus', 'Hal', 'Ike', 'Jo', 'Kay', 'Leo', 'Max', 'Nat', 'Oz', 'Pat', 'Ray', 'Sam', 'Tom', 'Val', 'Wes', 'Zoe', 'Amy', 'Deb', 'Eve', 'Gem']
        };
    }

    initializeElements() {
        this.categorySelect = document.getElementById('nameCategory');
        this.personOptions = document.getElementById('person-options');
        this.businessOptions = document.getElementById('business-options');
        this.fantasyOptions = document.getElementById('fantasy-options');
        this.nicknameOptions = document.getElementById('nickname-options');
        this.bulkCountSelect = document.getElementById('bulkCount');
        this.generateBtn = document.getElementById('generateBtn');
        this.nameResults = document.getElementById('nameResults');
        this.favoritesList = document.getElementById('favoritesList');
        this.copyAllBtn = document.getElementById('copyAllBtn');
        this.clearBtn = document.getElementById('clearBtn');
        this.exportFavoritesBtn = document.getElementById('exportFavoritesBtn');
        this.clearFavoritesBtn = document.getElementById('clearFavoritesBtn');
    }

    setupEventListeners() {
        this.categorySelect.addEventListener('change', () => this.handleCategoryChange());
        this.generateBtn.addEventListener('click', () => this.generateNames());
        this.copyAllBtn.addEventListener('click', () => this.copyAllNames());
        this.clearBtn.addEventListener('click', () => this.clearResults());
        this.exportFavoritesBtn.addEventListener('click', () => this.exportFavorites());
        this.clearFavoritesBtn.addEventListener('click', () => this.clearFavorites());
    }

    handleCategoryChange() {
        const category = this.categorySelect.value;
        
        // Hide all category options
        document.querySelectorAll('.category-options').forEach(option => {
            option.classList.remove('active');
        });
        
        // Show selected category options
        document.getElementById(`${category}-options`).classList.add('active');
    }

    generateNames() {
        const category = this.categorySelect.value;
        const count = parseInt(this.bulkCountSelect.value);
        
        this.generateBtn.classList.add('loading');
        this.generateBtn.textContent = 'Generating...';
        
        setTimeout(() => {
            const names = [];
            
            for (let i = 0; i < count; i++) {
                let name;
                switch (category) {
                    case 'person':
                        name = this.generatePersonName();
                        break;
                    case 'business':
                        name = this.generateBusinessName();
                        break;
                    case 'fantasy':
                        name = this.generateFantasyName();
                        break;
                    case 'nickname':
                        name = this.generateNickname();
                        break;
                    default:
                        name = this.generatePersonName();
                }
                
                if (name && !names.includes(name)) {
                    names.push(name);
                }
            }
            
            this.displayResults(names, category);
            this.generateBtn.classList.remove('loading');
            this.generateBtn.textContent = 'Generate Names';
            this.generateBtn.classList.add('generate-success');
            setTimeout(() => this.generateBtn.classList.remove('generate-success'), 300);
            
            this.updateActionButtons();
        }, 300);
    }

    generatePersonName() {
        const gender = document.getElementById('personGender').value;
        const culture = document.getElementById('personCulture').value;
        const includeMiddle = document.getElementById('includeMiddleName').checked;
        
        let firstName, lastName, middleName = '';
        
        // Select first name
        if (gender === 'any') {
            const genders = ['male', 'female', 'unisex'];
            const randomGender = genders[Math.floor(Math.random() * genders.length)];
            firstName = this.getRandomName(this.firstNames[randomGender], culture);
        } else {
            firstName = this.getRandomName(this.firstNames[gender], culture);
        }
        
        // Select last name
        lastName = this.getRandomName(this.lastNames, culture);
        
        // Select middle name if requested
        if (includeMiddle) {
            middleName = this.getRandomName(this.middleNames, culture);
        }
        
        return middleName ? `${firstName} ${middleName} ${lastName}` : `${firstName} ${lastName}`;
    }

    generateBusinessName() {
        const type = document.getElementById('businessType').value;
        const includeSuffix = document.getElementById('includeBusinessSuffix').checked;
        
        let prefix, suffix;
        
        if (type === 'any') {
            const types = Object.keys(this.businessNames.prefixes);
            const randomType = types[Math.floor(Math.random() * types.length)];
            prefix = this.businessNames.prefixes[randomType][Math.floor(Math.random() * this.businessNames.prefixes[randomType].length)];
            suffix = this.businessNames.suffixes[randomType][Math.floor(Math.random() * this.businessNames.suffixes[randomType].length)];
        } else {
            prefix = this.businessNames.prefixes[type][Math.floor(Math.random() * this.businessNames.prefixes[type].length)];
            suffix = this.businessNames.suffixes[type][Math.floor(Math.random() * this.businessNames.suffixes[type].length)];
        }
        
        let businessName = `${prefix} ${suffix}`;
        
        if (includeSuffix) {
            const businessSuffix = this.businessSuffixes[Math.floor(Math.random() * this.businessSuffixes.length)];
            businessName += ` ${businessSuffix}`;
        }
        
        return businessName;
    }

    generateFantasyName() {
        const type = document.getElementById('fantasyType').value;
        const gender = document.getElementById('fantasyGender').value;
        
        if (type === 'kingdom' || type === 'city' || type === 'dragon' || type === 'wizard') {
            return this.fantasyNames[type][Math.floor(Math.random() * this.fantasyNames[type].length)];
        }
        
        if (gender === 'any') {
            const genders = ['male', 'female'];
            const randomGender = genders[Math.floor(Math.random() * genders.length)];
            return this.fantasyNames[type][randomGender][Math.floor(Math.random() * this.fantasyNames[type][randomGender].length)];
        } else {
            return this.fantasyNames[type][gender][Math.floor(Math.random() * this.fantasyNames[type][gender].length)];
        }
    }

    generateNickname() {
        const style = document.getElementById('nicknameStyle').value;
        return this.nicknames[style][Math.floor(Math.random() * this.nicknames[style].length)];
    }

    getRandomName(nameObj, culture) {
        if (culture === 'any') {
            const cultures = Object.keys(nameObj);
            const randomCulture = cultures[Math.floor(Math.random() * cultures.length)];
            return nameObj[randomCulture][Math.floor(Math.random() * nameObj[randomCulture].length)];
        } else {
            return nameObj[culture][Math.floor(Math.random() * nameObj[culture].length)];
        }
    }

    displayResults(names, category) {
        this.nameResults.innerHTML = '';
        
        if (names.length === 0) {
            this.nameResults.innerHTML = '<div class="placeholder"><p>No names generated. Try adjusting your settings.</p></div>';
            return;
        }
        
        names.forEach(name => {
            const nameItem = document.createElement('div');
            nameItem.className = 'name-item';
            nameItem.innerHTML = `
                <span class="name-text">${name}</span>
                <div class="name-actions">
                    <button class="name-action" onclick="nameGenerator.copyName('${name}')" title="Copy to clipboard">📋</button>
                    <button class="name-action ${this.isFavorite(name) ? 'favorited' : ''}" onclick="nameGenerator.toggleFavorite('${name}', '${category}')" title="Add to favorites">❤️</button>
                </div>
            `;
            this.nameResults.appendChild(nameItem);
        });
    }

    copyName(name) {
        navigator.clipboard.writeText(name).then(() => {
            this.showNotification('Name copied to clipboard!');
        }).catch(err => {
            console.error('Failed to copy: ', err);
            this.showNotification('Failed to copy name');
        });
    }

    copyAllNames() {
        const nameItems = document.querySelectorAll('.name-text');
        const names = Array.from(nameItems).map(item => item.textContent);
        const allNames = names.join('\n');
        
        navigator.clipboard.writeText(allNames).then(() => {
            this.showNotification('All names copied to clipboard!');
        }).catch(err => {
            console.error('Failed to copy: ', err);
            this.showNotification('Failed to copy names');
        });
    }

    clearResults() {
        this.nameResults.innerHTML = '<div class="placeholder"><p>Click "Generate Names" to create your first batch of names!</p></div>';
        this.updateActionButtons();
    }

    toggleFavorite(name, category) {
        const existingIndex = this.favorites.findIndex(fav => fav.name === name);
        
        if (existingIndex >= 0) {
            this.favorites.splice(existingIndex, 1);
        } else {
            this.favorites.push({
                name: name,
                category: category,
                timestamp: Date.now()
            });
        }
        
        this.saveFavorites();
        this.updateFavoritesList();
        this.updateActionButtons();
        
        // Update the heart icon
        const heartButtons = document.querySelectorAll('.name-action[onclick*="' + name + '"]');
        heartButtons.forEach(btn => {
            if (btn.title === 'Add to favorites') {
                btn.classList.toggle('favorited');
            }
        });
    }

    isFavorite(name) {
        return this.favorites.some(fav => fav.name === name);
    }

    updateFavoritesList() {
        if (this.favorites.length === 0) {
            this.favoritesList.innerHTML = '<div class="placeholder"><p>Your favorite names will appear here. Click the heart icon next to any generated name to save it!</p></div>';
            return;
        }
        
        this.favoritesList.innerHTML = '';
        
        this.favorites.forEach((favorite, index) => {
            const favoriteItem = document.createElement('div');
            favoriteItem.className = 'favorite-item';
            favoriteItem.innerHTML = `
                <div class="favorite-info">
                    <div class="favorite-name">${favorite.name}</div>
                    <div class="favorite-category">${favorite.category}</div>
                </div>
                <div class="favorite-actions">
                    <button class="name-action" onclick="nameGenerator.copyName('${favorite.name}')" title="Copy to clipboard">📋</button>
                    <button class="name-action" onclick="nameGenerator.removeFavorite(${index})" title="Remove from favorites">🗑️</button>
                </div>
            `;
            this.favoritesList.appendChild(favoriteItem);
        });
    }

    removeFavorite(index) {
        this.favorites.splice(index, 1);
        this.saveFavorites();
        this.updateFavoritesList();
        this.updateActionButtons();
    }

    exportFavorites() {
        const favoritesText = this.favorites.map(fav => `${fav.name} (${fav.category})`).join('\n');
        const blob = new Blob([favoritesText], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'favorite-names.txt';
        a.click();
        URL.revokeObjectURL(url);
        this.showNotification('Favorites exported!');
    }

    clearFavorites() {
        if (confirm('Are you sure you want to clear all favorites?')) {
            this.favorites = [];
            this.saveFavorites();
            this.updateFavoritesList();
            this.updateActionButtons();
            this.showNotification('Favorites cleared!');
        }
    }

    saveFavorites() {
        localStorage.setItem('nameGenFavorites', JSON.stringify(this.favorites));
    }

    updateActionButtons() {
        const hasResults = this.nameResults.children.length > 0 && !this.nameResults.querySelector('.placeholder');
        const hasFavorites = this.favorites.length > 0;
        
        this.copyAllBtn.disabled = !hasResults;
        this.clearBtn.disabled = !hasResults;
        this.exportFavoritesBtn.disabled = !hasFavorites;
        this.clearFavoritesBtn.disabled = !hasFavorites;
    }

    showNotification(message) {
        const notification = document.createElement('div');
        notification.className = 'copied-notification';
        notification.textContent = message;
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.classList.add('show');
        }, 100);
        
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 2000);
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.nameGenerator = new NameGenerator();
});