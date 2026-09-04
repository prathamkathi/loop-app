import os
import json
import uuid

handles = [
    "ankahi_iitd", "axlr8r.formula.racing", "bhmiitd", "brcaiitd", "bsa.iitd",
    "bsp.iitdelhi", "bsw_iitd", "caic_iitd", "debsoc_iitd", "designclubiitd",
    "edc_iitd", "enactus_iitdelhi", "envogueiitd", "facc.azure.iitd",
    "hindisamiti.iitd", "humans_of_bloodconnect", "igem_iitd", "iitdaa",
    "iitddanceclub", "iitdelhi", "iitdmusicclub", "iitdonair", "iitdqc",
    "kaizen.iitd", "litclub.iitd", "literati.iitd", "nssiitd", "ocs_iitd",
    "outreach_iitd", "pac_iitd", "pfciitd", "rendezvous.iitd", "sac_iitdelhi",
    "speranza.iitd", "spicmacay_iitd", "sportech.iitd", "tryst.iitd",
    "uzyre.iitd", "vdefyn.iitd"
]

events_map = {
    "ankahi_iitd": [("Nukkad Natak Prelims", "Watch hostels clash in the annual street play competition.", "BRCA Cultural"), ("Natya Humsafar Play", "A gripping stage play exploring modern relationships.", "BRCA Cultural")],
    "axlr8r.formula.racing": [("EV Showcase & Track Day", "Watch the latest electric formula car tear up the track.", "CAIC Technical"), ("Recruitment Drive", "Join the official Formula Student team of IIT Delhi.", "CAIC Technical")],
    "bhmiitd": [("Hostel Mess Rebate Deadline", "Submit your rebate applications for the upcoming mid-sem break.", "Academic & Admin"), ("Inter-Hostel Hygiene Drive", "A joint initiative across all hostels for better living conditions.", "Academic & Admin")],
    "brcaiitd": [("Rendezvous Launch", "The official kickoff for North India's largest cultural fest.", "Major Fests"), ("BRCA Night", "A celebration of all cultural clubs featuring the best performances of the year.", "BRCA Cultural")],
    "bsa.iitd": [("Inter-Hostel Athletics Meet", "The battle for the General Championship begins.", "BSA Sports"), ("Sportech Opening Ceremony", "Kickoff to the annual sports festival of IIT Delhi.", "Major Fests")],
    "bsp.iitdelhi": [("Campus Magazine Launch", "Grab a physical copy of the new campus magazine.", "BRCA Cultural"), ("Literati Poetry Slam", "Spoken word and powerful storytelling.", "Major Fests")],
    "bsw_iitd": [("Mentorship Orientation", "Mandatory session for all incoming freshers.", "BSW Welfare"), ("Mental Health Workshop", "A guided session on managing academic stress.", "BSW Welfare")],
    "caic_iitd": [("Tryst Keynote Series", "Fireside chat with global tech leaders.", "Major Fests"), ("Winter Code Hackathon", "Ship something real in 36 hours.", "CAIC Technical")],
    "debsoc_iitd": [("Mukhaute - Annual Debate", "The flagship parliamentary debate tournament.", "BRCA Cultural"), ("Freshers Parliamentary Debate", "An introductory debate for first-year students.", "BRCA Cultural")],
    "designclubiitd": [("UI/UX Bootcamp", "Learn the basics of Figma and user research.", "BRCA Cultural"), ("Designathon", "A 24-hour design challenge for campus creatives.", "BRCA Cultural")],
    "edc_iitd": [("Founder's Talk: Building a Unicorn", "Alumni founder shares their journey.", "E-Cell & Startups"), ("Pitch Cafe", "Pitch your raw idea over coffee to angel investors.", "E-Cell & Startups")],
    "enactus_iitdelhi": [("Social Entrepreneurship Bootcamp", "Learn to build sustainable businesses for social good.", "E-Cell & Startups"), ("Project Arth Showcase", "Exhibition of sustainable products developed by the team.", "E-Cell & Startups")],
    "envogueiitd": [("Fashion Show Prelims", "Inter-hostel fashion and modeling competition.", "BRCA Cultural"), ("EnVogue Auditions", "Tryouts for the official fashion society of IIT Delhi.", "BRCA Cultural")],
    "facc.azure.iitd": [("Live Sketching Workshop", "Master the basics of charcoal and pencil sketching.", "BRCA Cultural"), ("Art Exhibition", "Showcase of the best campus art in the SAC lobby.", "BRCA Cultural")],
    "hindisamiti.iitd": [("Kavi Sammelan", "An evening of profound Hindi poetry and ghazals.", "BRCA Cultural"), ("Hindi Debate Championship", "Inter-hostel Hindi parliamentary debate.", "BRCA Cultural")],
    "humans_of_bloodconnect": [("Mega Blood Donation Camp", "Donate blood, save a life. Medical team present.", "BSW Welfare"), ("Awareness Drive", "Volunteering drive for blood donation awareness.", "BSW Welfare")],
    "igem_iitd": [("Synthetic Biology 101", "An introduction to genetic engineering and the iGEM competition.", "CAIC Technical"), ("Lab Tour", "A guided tour of the biotech labs and ongoing projects.", "CAIC Technical")],
    "iitdaa": [("Alumni Networking Dinner", "Connect with illustrious alumni across various industries.", "Academic & Admin"), ("Mentorship Program Launch", "Pairing students with alumni mentors for career guidance.", "Academic & Admin")],
    "iitddanceclub": [("Duo Dance Battles", "Face off in pairs across various dance styles.", "BRCA Cultural"), ("Dance Workshop", "Learn contemporary and hip-hop basics.", "BRCA Cultural")],
    "iitdelhi": [("Convocation Ceremony", "The annual graduation ceremony for the outgoing batch.", "Academic & Admin"), ("Director's Address", "State of the Institute address by the Director.", "Academic & Admin")],
    "iitdmusicclub": [("Acoustic Night", "An intimate evening of acoustic sets and unplugged covers.", "BRCA Cultural"), ("Band Wars Prelims", "Campus bands battle it out for a spot in Rendezvous.", "BRCA Cultural")],
    "iitdonair": [("Podcast Launch", "Live recording of the new campus podcast episode.", "BRCA Cultural"), ("Radio Jockey Hunt", "Auditions for the next voice of IIT Delhi.", "BRCA Cultural")],
    "iitdqc": [("Sci-Tech Quiz", "Test your knowledge of science, tech, and trivia.", "BRCA Cultural"), ("Pop Culture Fiesta", "A quiz dedicated to movies, music, and pop culture.", "BRCA Cultural")],
    "kaizen.iitd": [("Kaizen Opening Ceremony", "Kickoff to the annual social festival.", "Major Fests"), ("Social Innovation Pitch", "Pitch ideas that solve pressing social issues.", "Major Fests")],
    "litclub.iitd": [("Creative Writing Workshop", "Hone your storytelling and prose skills.", "BRCA Cultural"), ("Book Exchange Mixer", "Bring a book, take a book, and discuss literature.", "BRCA Cultural")],
    "literati.iitd": [("Literati Opening Panel", "Discussions on modern literature and media.", "Major Fests"), ("Storytelling Night", "An open mic for short stories and narratives.", "Major Fests")],
    "nssiitd": [("Campus Cleanup Drive", "Join us for the monthly campus cleanup. Gloves provided.", "NSS Service"), ("Munirka Teaching Drive", "Weekend teaching drive for underprivileged children.", "NSS Service")],
    "ocs_iitd": [("Placement Orientation", "Crucial guidelines and timeline for the upcoming placement season.", "Academic & Admin"), ("Resume Building Session", "Expert tips on crafting a shortlist-worthy resume.", "Academic & Admin")],
    "outreach_iitd": [("Open House", "Guided campus tour and project showcases for school students.", "Academic & Admin"), ("Science Demonstration", "Interactive science experiments for visiting students.", "Academic & Admin")],
    "pac_iitd": [("Star Gazing Night", "Telescope viewing session on the main building roof.", "CAIC Technical"), ("Astrophysics Seminar", "Guest lecture on black holes and quantum mechanics.", "CAIC Technical")],
    "pfciitd": [("Campus Photowalk", "A guided photography walk capturing the essence of IITD.", "BRCA Cultural"), ("Short Film Screening", "Screening of films produced by the club this semester.", "BRCA Cultural")],
    "rendezvous.iitd": [("Pronite: The Headline Act", "The biggest cultural festival concludes with an explosive pronite.", "Major Fests"), ("Spectrum - Dance Competition", "Inter-college group dance competition.", "Major Fests")],
    "sac_iitdelhi": [("SAC General Body Meeting", "Open forum to discuss student issues and policies.", "Academic & Admin"), ("Hostel Affairs Discussion", "Townhall meeting focusing on hostel infrastructure.", "Academic & Admin")],
    "speranza.iitd": [("Speranza Comedy Night", "Stand-up comedy special as part of the BSW youth fest.", "Major Fests"), ("Talk Show: Unfiltered", "Candid conversations with inspiring personalities.", "Major Fests")],
    "spicmacay_iitd": [("Classical Music Concert", "An evening of mesmerizing Indian classical music.", "BRCA Cultural"), ("Heritage Walk", "A guided tour exploring the historical monuments around campus.", "BRCA Cultural")],
    "sportech.iitd": [("Sportech Marathon", "The annual campus marathon open to all students.", "Major Fests"), ("Inter-College Basketball Finals", "High stakes match under the floodlights.", "Major Fests")],
    "tryst.iitd": [("RoboWars", "The ultimate clash of combat robots.", "Major Fests"), ("Hackathon: Code Red", "48-hour coding challenge.", "Major Fests")],
    "uzyre.iitd": [("Street Dance Cypher", "Open cyphers and battles by the official street dance society.", "BRCA Cultural"), ("Urban Choreography Workshop", "Learn advanced street dance routines.", "BRCA Cultural")],
    "vdefyn.iitd": [("Bollywood Night Showcase", "High-energy Bollywood dance performances.", "BRCA Cultural"), ("Crew Auditions", "Tryouts to join the prominent western dance crew.", "BRCA Cultural")]
}

all_events = []
count = 1

for handle, events in events_map.items():
    for title, blurb, category in events:
        event = {
            "id": f"e_stock_{count}",
            "title": title,
            "host": f"@{handle}",
            "hostAvatar": f"https://picsum.photos/seed/host_{handle}/120/120",
            "category": category,
            "date": "20 Nov",
            "day": "Monday",
            "time": "5:30 PM",
            "venue": "IIT Delhi Campus",
            "image": f"https://picsum.photos/seed/event_{count}/800/800",
            "aspect": "square",
            "blurb": blurb,
            "confidenceScore": 95
        }
        all_events.append(event)
        count += 1

os.makedirs("stock", exist_ok=True)
with open("stock/real_events_generated.json", "w") as f:
    json.dump(all_events, f, indent=2)

print(f"Successfully wrote {len(all_events)} real events to stock/real_events_generated.json!")
