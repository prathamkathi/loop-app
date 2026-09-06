import { getClubAvatar } from './avatars';

export type ClubItem = {
  id: string;
  name: string;
  handle: string;
  description: string;
  category: 'Boards' | 'Cultural' | 'Fests' | 'Administration' | 'Technical';
  parentTag: 'BRCA' | 'CAIC' | 'BSA' | 'BSW' | 'NSS' | 'BSP' | 'Independent' | 'Official';
  avatar: string;
};

export const CLUBS: ClubItem[] = [
  // BOARDS
  { id: 'c1', name: 'Board for Hostel Management (BHM)', handle: '@bhmiitd', description: 'Management and maintenance of all student hostels and messes at IIT Delhi.', category: 'Boards', parentTag: 'Official', avatar: getClubAvatar('bhmiitd') },
  { id: 'c2', name: 'Board for Recreational and Creative Activities (BRCA)', handle: '@brcaiitd', description: 'The apex body managing all cultural and co-curricular clubs, organizing fests.', category: 'Boards', parentTag: 'BRCA', avatar: getClubAvatar('brcaiitd') },
  { id: 'c3', name: 'Board for Sports Activities (BSA)', handle: '@bsa.iitd', description: 'Manages all sports facilities, inter-hostel tournaments, and Inter-IIT Sports Meets.', category: 'Boards', parentTag: 'BSA', avatar: getClubAvatar('bsa.iitd') },
  { id: 'c4', name: 'Board for Student Publications (BSP)', handle: '@bsp.iitdelhi', description: 'The official student media and publication body, producing newsletters and journalism.', category: 'Boards', parentTag: 'BSP', avatar: getClubAvatar('bsp.iitdelhi') },
  { id: 'c5', name: 'Board for Student Welfare (BSW)', handle: '@bsw_iitd', description: 'Focuses on student wellbeing, mentorship, financial assistance, and mental health.', category: 'Boards', parentTag: 'BSW', avatar: getClubAvatar('bsw_iitd') },

  // CULTURAL & CO-CURRICULAR
  { id: 'c6', name: 'Ankahi - Dramatics Society', handle: '@ankahi_iitd', description: 'The official dramatics society specializing in stage plays, street plays, and mime.', category: 'Cultural', parentTag: 'BRCA', avatar: getClubAvatar('ankahi_iitd') },
  { id: 'c7', name: 'Debating Society (DebSoc)', handle: '@debsoc_iitd', description: 'Represents the institute in parliamentary debates and organizes tournaments.', category: 'Cultural', parentTag: 'BRCA', avatar: getClubAvatar('debsoc_iitd') },
  { id: 'c8', name: 'Design Club', handle: '@designclubiitd', description: 'A community for UI/UX design, graphic design, and visual arts enthusiasts.', category: 'Cultural', parentTag: 'BRCA', avatar: getClubAvatar('designclubiitd') },
  { id: 'c9', name: 'EnVogue - Fashion Society', handle: '@envogueiitd', description: 'The official fashion society, showcasing innovative clothing designs.', category: 'Cultural', parentTag: 'BRCA', avatar: getClubAvatar('envogueiitd') },
  { id: 'c10', name: 'Fine Arts and Crafts Club (Azure)', handle: '@facc.azure.iitd', description: 'Fosters creativity through painting, sketching, digital art, and crafts.', category: 'Cultural', parentTag: 'BRCA', avatar: getClubAvatar('facc.azure.iitd') },
  { id: 'c11', name: 'Hindi Samiti', handle: '@hindisamiti.iitd', description: 'Promotes Hindi literature, poetry (Kavi Sammelans), and debates.', category: 'Cultural', parentTag: 'BRCA', avatar: getClubAvatar('hindisamiti.iitd') },
  { id: 'c12', name: 'Dance Club', handle: '@iitddanceclub', description: 'The umbrella club for dance enthusiasts covering various genres.', category: 'Cultural', parentTag: 'BRCA', avatar: getClubAvatar('iitddanceclub') },
  { id: 'c13', name: 'Music Club', handle: '@iitdmusicclub', description: 'A platform for vocalists and instrumentalists covering Western and Indian styles.', category: 'Cultural', parentTag: 'BRCA', avatar: getClubAvatar('iitdmusicclub') },
  { id: 'c14', name: 'IITD On Air', handle: '@iitdonair', description: 'The official broadcasting and radio club producing podcasts and interviews.', category: 'Cultural', parentTag: 'Independent', avatar: getClubAvatar('iitdonair') },
  { id: 'c15', name: 'Quizzing Club', handle: '@iitdqc', description: 'Conducts quizzes spanning pop culture, science, sports, and general trivia.', category: 'Cultural', parentTag: 'BRCA', avatar: getClubAvatar('iitdqc') },
  { id: 'c16', name: 'Literary Club', handle: '@litclub.iitd', description: 'Promotes creative writing, poetry, and literature appreciation.', category: 'Cultural', parentTag: 'BRCA', avatar: getClubAvatar('litclub.iitd') },
  { id: 'c17', name: 'Photography and Films Club (PFC)', handle: '@pfciitd', description: 'Focuses on photography, videography, and short film production.', category: 'Cultural', parentTag: 'BRCA', avatar: getClubAvatar('pfciitd') },
  { id: 'c18', name: 'SPIC MACAY', handle: '@spicmacay_iitd', description: 'Promotes Indian classical music, dance, and culture.', category: 'Cultural', parentTag: 'BRCA', avatar: getClubAvatar('spicmacay_iitd') },
  { id: 'c19', name: 'U-Zyre', handle: '@uzyre.iitd', description: 'The official street dance society of IIT Delhi.', category: 'Cultural', parentTag: 'Independent', avatar: getClubAvatar('uzyre.iitd') },
  { id: 'c20', name: 'V-Defyn', handle: '@vdefyn.iitd', description: 'A prominent western and Bollywood dance crew.', category: 'Cultural', parentTag: 'Independent', avatar: getClubAvatar('vdefyn.iitd') },

  // FESTS
  { id: 'c21', name: 'Kaizen', handle: '@kaizen.iitd', description: 'The annual social festival organized by NSS to promote social innovation.', category: 'Fests', parentTag: 'NSS', avatar: getClubAvatar('kaizen.iitd') },
  { id: 'c22', name: 'Literati', handle: '@literati.iitd', description: 'The annual literary festival featuring talks and poetry slams.', category: 'Fests', parentTag: 'BSP', avatar: getClubAvatar('literati.iitd') },
  { id: 'c23', name: 'Rendezvous', handle: '@rendezvous.iitd', description: 'North India\'s largest cultural festival.', category: 'Fests', parentTag: 'BRCA', avatar: getClubAvatar('rendezvous.iitd') },
  { id: 'c24', name: 'Speranza', handle: '@speranza.iitd', description: 'The annual youth festival organized by BSW.', category: 'Fests', parentTag: 'BSW', avatar: getClubAvatar('speranza.iitd') },
  { id: 'c25', name: 'Sportech', handle: '@sportech.iitd', description: 'The annual sports festival hosting inter-college tournaments.', category: 'Fests', parentTag: 'BSA', avatar: getClubAvatar('sportech.iitd') },
  { id: 'c26', name: 'Tryst', handle: '@tryst.iitd', description: 'North India\'s largest technical and entrepreneurial festival.', category: 'Fests', parentTag: 'CAIC', avatar: getClubAvatar('tryst.iitd') },

  // ADMINISTRATION & OFFICIAL
  { id: 'c27', name: 'CAIC', handle: '@caic_iitd', description: 'The apex body managing technical clubs and academic interactions.', category: 'Administration', parentTag: 'CAIC', avatar: getClubAvatar('caic_iitd') },
  { id: 'c28', name: 'Alumni Association', handle: '@iitdaa', description: 'Connects alumni worldwide and facilitates networking.', category: 'Administration', parentTag: 'Official', avatar: getClubAvatar('iitdaa') },
  { id: 'c29', name: 'IIT Delhi (Official)', handle: '@iitdelhi', description: 'The primary official Instagram page for IIT Delhi.', category: 'Administration', parentTag: 'Official', avatar: getClubAvatar('iitdelhi') },
  { id: 'c30', name: 'National Service Scheme (NSS)', handle: '@nssiitd', description: 'Focuses on community service, environmental initiatives, and social upliftment.', category: 'Administration', parentTag: 'NSS', avatar: getClubAvatar('nssiitd') },
  { id: 'c31', name: 'Office of Career Services (OCS)', handle: '@ocs_iitd', description: 'The official placement and internship cell.', category: 'Administration', parentTag: 'Official', avatar: getClubAvatar('ocs_iitd') },
  { id: 'c32', name: 'Outreach Cell', handle: '@outreach_iitd', description: 'Handles external communications and campus tours.', category: 'Administration', parentTag: 'Official', avatar: getClubAvatar('outreach_iitd') },
  { id: 'c33', name: 'Student Affairs Council (SAC)', handle: '@sac_iitdelhi', description: 'The apex student representative body dealing with institute policy.', category: 'Administration', parentTag: 'Official', avatar: getClubAvatar('sac_iitdelhi') },

  // TECHNICAL
  { id: 'c35', name: 'Axlr8r Formula Racing', handle: '@axlr8r.formula.racing', description: 'The official Formula Student team building and racing electric formula cars.', category: 'Technical', parentTag: 'CAIC', avatar: getClubAvatar('axlr8r.formula.racing') },
  { id: 'c36', name: 'BloodConnect', handle: '@humans_of_bloodconnect', description: 'Student-run initiative organizing blood donation camps across NCR.', category: 'Technical', parentTag: 'Independent', avatar: getClubAvatar('humans_of_bloodconnect') },
  { id: 'c38', name: 'Entrepreneurship Development Cell (eDC)', handle: '@edc_iitd', description: 'Fosters startup culture and organizes the annual flagship E-Summit.', category: 'Technical', parentTag: 'Independent', avatar: getClubAvatar('edc_iitd') },
  { id: 'c39', name: 'Enactus IIT Delhi', handle: '@enactus_iitd', description: 'Uses entrepreneurial action and social enterprise to empower underprivileged communities.', category: 'Technical', parentTag: 'Independent', avatar: getClubAvatar('enactus_iitd') },
  { id: 'c40', name: 'DevClub - Software Development Club', handle: '@devclub_iitd', description: 'Premier student developer and open-source software engineering community at IIT Delhi.', category: 'Technical', parentTag: 'CAIC', avatar: getClubAvatar('devclub_iitd') },
  { id: 'c41', name: 'Robotics Club IIT Delhi', handle: '@roboticsclub_iitd', description: 'Builds autonomous bots, rovers, and represents IIT Delhi in international robotics championships.', category: 'Technical', parentTag: 'CAIC', avatar: getClubAvatar('roboticsclub_iitd') },
  { id: 'c42', name: 'Aeromodelling Club', handle: '@acid_iitd', description: 'Designing, building, and piloting autonomous drones, RC fixed-wings, and quadcopters.', category: 'Technical', parentTag: 'CAIC', avatar: getClubAvatar('acid_iitd') },
  { id: 'c43', name: 'Economics Club', handle: '@economics_club_iitd', description: 'Fosters case solving, finance modeling, and analytics competitions for campus students.', category: 'Technical', parentTag: 'Independent', avatar: getClubAvatar('economics_club_iitd') },
  { id: 'c44', name: 'iGEM IIT Delhi', handle: '@igem_iitd', description: 'Representing IIT Delhi in International Genetically Engineered Machine synthetic biology competition.', category: 'Technical', parentTag: 'CAIC', avatar: getClubAvatar('igem_iitd') },
  { id: 'c45', name: 'Physics & Astronomy Club', handle: '@pac_iitd', description: 'Promotes stargazing, astrophotography, physics symposiums, and space exploration projects.', category: 'Technical', parentTag: 'CAIC', avatar: getClubAvatar('pac_iitd') },
];
