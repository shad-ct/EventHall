-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Dec 11, 2025 at 03:16 PM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `eventhall`
--

-- --------------------------------------------------------

--
-- Table structure for table `admin_applications`
--

CREATE TABLE `admin_applications` (
  `id` varchar(255) NOT NULL,
  `user_id` varchar(255) NOT NULL,
  `motivation_text` text NOT NULL,
  `status` enum('PENDING','APPROVED','REJECTED') DEFAULT 'PENDING',
  `reviewed_by_user_id` varchar(255) DEFAULT NULL,
  `reviewed_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `events`
--

CREATE TABLE `events` (
  `id` varchar(255) NOT NULL,
  `title` varchar(500) NOT NULL,
  `description` longtext NOT NULL,
  `date` varchar(20) NOT NULL,
  `time` varchar(20) NOT NULL,
  `location` varchar(500) NOT NULL,
  `district` varchar(255) NOT NULL,
  `google_maps_link` varchar(500) DEFAULT NULL,
  `entry_fee` varchar(255) DEFAULT NULL,
  `is_free` tinyint(1) DEFAULT 0,
  `prize_details` text DEFAULT NULL,
  `contact_email` varchar(255) NOT NULL,
  `contact_phone` varchar(20) NOT NULL,
  `external_registration_link` varchar(500) DEFAULT NULL,
  `registration_method` enum('EXTERNAL','FORM') DEFAULT 'EXTERNAL',
  `how_to_register_link` varchar(500) DEFAULT NULL,
  `instagram_url` varchar(500) DEFAULT NULL,
  `facebook_url` varchar(500) DEFAULT NULL,
  `youtube_url` varchar(500) DEFAULT NULL,
  `banner_url` varchar(500) DEFAULT NULL,
  `status` enum('DRAFT','PENDING_APPROVAL','PUBLISHED','REJECTED','ARCHIVED') DEFAULT 'DRAFT',
  `is_featured` tinyint(1) DEFAULT 0,
  `featured_at` timestamp NULL DEFAULT NULL,
  `featured_by` varchar(255) DEFAULT NULL,
  `rejection_reason` text DEFAULT NULL,
  `created_by_id` varchar(255) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `reviewed_by` varchar(255) DEFAULT NULL,
  `reviewed_at` timestamp NULL DEFAULT NULL,
  `archived_at` timestamp NULL DEFAULT NULL,
  `archived_by` varchar(255) DEFAULT NULL,
  `published_at` timestamp NULL DEFAULT NULL,
  `published_by` varchar(255) DEFAULT NULL,
  `unpublished_at` timestamp NULL DEFAULT NULL,
  `unpublished_by` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `events`
--

INSERT INTO `events` (`id`, `title`, `description`, `date`, `time`, `location`, `district`, `google_maps_link`, `entry_fee`, `is_free`, `prize_details`, `contact_email`, `contact_phone`, `external_registration_link`, `registration_method`, `how_to_register_link`, `instagram_url`, `facebook_url`, `youtube_url`, `banner_url`, `status`, `is_featured`, `featured_at`, `featured_by`, `rejection_reason`, `created_by_id`, `created_at`, `updated_at`, `reviewed_by`, `reviewed_at`, `archived_at`, `archived_by`, `published_at`, `published_by`, `unpublished_at`, `unpublished_by`) VALUES
('5a89wm1765456362587', 'wqeiorh', 'qkwjer', '2025-12-11', '19:02', 'Cherukunnu', 'Kozhikode', NULL, NULL, 1, NULL, 'alkdfj@gmail.com', '1232132131', NULL, 'FORM', NULL, NULL, NULL, NULL, NULL, 'PUBLISHED', 0, NULL, NULL, NULL, 'admin-1', '2025-12-11 12:32:42', '2025-12-11 13:20:21', 'uadmin-1', '2025-12-11 12:33:02', NULL, NULL, NULL, NULL, NULL, NULL),
('conf-001', 'Tech Conference 2024: Future of AI', 'Industry leaders discuss the future of AI, machine learning trends, and real-world applications. 5 keynote speakers and 20+ sessions.', '2025-12-18', '17:23', 'Convention Center, Grand Hall, Kottayam', 'Kottayam', 'https://maps.google.com/convention-center-kottayam', '4,999', 0, 'Networking lunch and conference materials', 'conference@eventhall.com', '+91-9876543212', 'https://eventhall.com/register/conf-001', 'EXTERNAL', 'https://eventhall.com/register/conf-001', '@techconf2024', 'facebook.com/techconf2024', 'youtube.com/techconf2024', 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&q=80', 'PUBLISHED', 0, NULL, NULL, NULL, 'admin-1', '2025-12-11 01:46:44', '2025-12-11 11:53:09', NULL, NULL, NULL, NULL, '2025-12-11 01:46:44', 'admin-1', NULL, NULL),
('conf-002', 'Digital India Summit 2025', 'National conference on digital transformation, entrepreneurship, and innovation in India. 100+ speakers and workshops.', '2025-01-20', '09:00 AM', 'Grand Hall, Convention Center, Kochi', 'Ernakulam', 'https://maps.google.com/grand-hall-kochi', '???3,999', 0, 'Conference pass, meals, and networking opportunities', 'india@eventhall.com', '+91-9876543228', 'https://eventhall.com/register/conf-002', 'EXTERNAL', 'https://eventhall.com/register/conf-002', '@digitalindia', 'facebook.com/digitalindia', 'youtube.com/digitalindia', 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&q=80', 'PUBLISHED', 0, NULL, NULL, NULL, 'admin-1', '2025-12-11 01:46:44', '2025-12-11 01:46:44', NULL, NULL, NULL, NULL, '2025-12-11 01:46:44', 'admin-1', NULL, NULL),
('conf-003', 'Women in Tech Conference', 'Celebrate and empower women in technology. Keynotes from successful female tech leaders and founders.', '2025-12-19', '17:36', 'Women Hub, Innovation Center, Trivandrum', 'Thiruvananthapuram', 'https://maps.google.com/women-hub-tvpm', 'Free', 1, 'Workshop materials and networking opportunities', 'womentech@eventhall.com', '+91-9876543229', 'https://eventhall.com/register/conf-003', 'EXTERNAL', 'https://eventhall.com/register/conf-003', '@womentech', 'facebook.com/womentech', 'youtube.com/womentech', 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=800&q=80', 'PUBLISHED', 1, NULL, NULL, NULL, 'admin-1', '2025-12-11 01:46:44', '2025-12-11 12:06:42', NULL, NULL, NULL, NULL, '2025-12-11 01:46:44', 'admin-1', NULL, NULL),
('conf-004', 'Blockchain & Web3 Global Forum', 'Explore blockchain technology, NFTs, and Web3 applications with industry pioneers. International speakers included.', '2025-03-10', '09:00 AM', 'Tech Summit Hall, Convention Zone, Thrissur', 'Thrissur', 'https://maps.google.com/tech-summit-thrissur', '???5,999', 0, 'Digital assets, workshops, and VIP networking', 'blockchain@eventhall.com', '+91-9876543230', 'https://eventhall.com/register/conf-004', 'EXTERNAL', 'https://eventhall.com/register/conf-004', '@blockchainweb3', 'facebook.com/blockchainweb3', 'youtube.com/blockchainweb3', 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&q=80', 'PUBLISHED', 0, NULL, NULL, NULL, 'admin-1', '2025-12-11 01:46:44', '2025-12-11 01:46:44', NULL, NULL, NULL, NULL, '2025-12-11 01:46:44', 'admin-1', NULL, NULL),
('conf-005', 'Python Developers Conference', 'Annual conference for Python developers featuring talks on frameworks, libraries, and best practices.', '2025-04-18', '09:00 AM', 'Dev Center, Developer Campus, Kozhikode', 'Kozhikode', 'https://maps.google.com/dev-center-kozhikode', '???2,999', 0, 'Conference badge and developer materials', 'pythonconf@eventhall.com', '+91-9876543231', 'https://eventhall.com/register/conf-005', 'EXTERNAL', 'https://eventhall.com/register/conf-005', '@pythonconf', 'facebook.com/pythonconf', 'youtube.com/pythonconf', 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&q=80', 'PUBLISHED', 1, NULL, NULL, NULL, 'admin-1', '2025-12-11 01:46:44', '2025-12-11 01:46:44', NULL, NULL, NULL, NULL, '2025-12-11 01:46:44', 'admin-1', NULL, NULL),
('cult-001', 'Classical Dance Fest 2025', 'Showcase of Kathakali, Mohiniyattam, and other classical dance forms from Kerala. Live performances all day.', '2025-01-18', '06:00 PM', 'Cultural Hall, Arts Center, Thiruvananthapuram', 'Thiruvananthapuram', 'https://maps.google.com/cultural-hall-tvpm', 'Free', 1, 'Complimentary dinner and drinks', 'dance@eventhall.com', '+91-9876543241', 'https://eventhall.com/register/cult-001', 'EXTERNAL', 'https://eventhall.com/register/cult-001', '@classicaldancefest', 'facebook.com/classicaldancefest', 'youtube.com/classicaldancefest', 'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=800&q=80', 'PUBLISHED', 1, NULL, NULL, NULL, 'admin-1', '2025-12-11 01:46:44', '2025-12-11 01:46:44', NULL, NULL, NULL, NULL, '2025-12-11 01:46:44', 'admin-1', NULL, NULL),
('cult-002', 'Theatre Festival 2025', 'Platform for emerging theater groups to showcase original and classical plays. Multiple performances daily.', '2025-02-20', '07:00 PM', 'Theater Complex, Drama Hub, Kochi', 'Ernakulam', 'https://maps.google.com/theater-complex-kochi', '???300', 0, 'Program booklet and refreshments', 'theatre@eventhall.com', '+91-9876543242', 'https://eventhall.com/register/cult-002', 'EXTERNAL', 'https://eventhall.com/register/cult-002', '@theatrefestival', 'facebook.com/theatrefestival', 'youtube.com/theatrefestival', 'https://images.unsplash.com/photo-1524985069026-dd778a71c7b4?w=800&q=80', 'PUBLISHED', 0, NULL, NULL, NULL, 'admin-1', '2025-12-11 01:46:44', '2025-12-11 01:46:44', NULL, NULL, NULL, NULL, '2025-12-11 01:46:44', 'admin-1', NULL, NULL),
('cult-003', 'Art Exhibition & Workshop', 'Contemporary art exhibition with workshops on painting, sculpture, and digital art. Live artist demonstrations.', '2025-03-08', '10:00 AM', 'Art Gallery, Creative Space, Kottayam', 'Kottayam', 'https://maps.google.com/art-gallery-kottayam', 'Free', 1, 'Art materials and workshop certificate', 'art@eventhall.com', '+91-9876543243', 'https://eventhall.com/register/cult-003', 'EXTERNAL', 'https://eventhall.com/register/cult-003', '@artexhibition', 'facebook.com/artexhibition', 'youtube.com/artexhibition', 'https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?w=800&q=80', 'PUBLISHED', 1, NULL, NULL, NULL, 'admin-1', '2025-12-11 01:46:44', '2025-12-11 01:46:44', NULL, NULL, NULL, NULL, '2025-12-11 01:46:44', 'admin-1', NULL, NULL),
('cult-004', 'Heritage Trail & Cultural Tour', 'Guided tour through heritage sites and cultural landmarks of Kerala. Expert guides and transportation.', '2025-04-01', '08:00 AM', 'Heritage Center, Tourism Hub, Kozhikode', 'Kozhikode', 'https://maps.google.com/heritage-center-kozhikode', '???1,500', 0, 'Lunch, entry fees, and souvenir', 'heritage@eventhall.com', '+91-9876543244', 'https://eventhall.com/register/cult-004', 'EXTERNAL', 'https://eventhall.com/register/cult-004', '@heritagetour', 'facebook.com/heritagetour', 'youtube.com/heritagetour', 'https://images.unsplash.com/photo-1488749807830-63789f68bb65?w=800&q=80', 'PUBLISHED', 0, NULL, NULL, NULL, 'admin-1', '2025-12-11 01:46:44', '2025-12-11 01:46:44', NULL, NULL, NULL, NULL, '2025-12-11 01:46:44', 'admin-1', NULL, NULL),
('cult-005', 'Onam Celebrations 2025', 'Traditional Onam festival celebrations with Kathakali, Ottamthullal, and cultural programs. Family-friendly event.', '2025-04-25', '05:00 PM', 'Community Ground, Festival Venue, Thrissur', 'Thrissur', 'https://maps.google.com/community-ground-thrissur', 'Free', 1, 'Traditional feast and cultural merchandise', 'onam@eventhall.com', '+91-9876543245', 'https://eventhall.com/register/cult-005', 'EXTERNAL', 'https://eventhall.com/register/cult-005', '@onamfest', 'facebook.com/onamfest', 'youtube.com/onamfest', 'https://images.unsplash.com/photo-1549887534-7e9e1a5e1b1f?w=800&q=80', 'PUBLISHED', 0, NULL, NULL, NULL, 'admin-1', '2025-12-11 01:46:44', '2025-12-11 02:56:11', NULL, NULL, NULL, NULL, '2025-12-11 01:46:44', 'admin-1', NULL, NULL),
('e83nu51765430086915', 'tes02', 'hello', '2025-12-12', '10:42', 'MES College', 'Kannur', NULL, '599', 0, NULL, 'shad@gmail.com', '1233123123', NULL, 'EXTERNAL', NULL, NULL, NULL, NULL, 'https://i.ibb.co/mCh1Q2Nn/momos-v.jpg', 'PUBLISHED', 0, NULL, NULL, NULL, 'admin-1', '2025-12-11 05:14:46', '2025-12-11 05:15:07', 'uadmin-1', '2025-12-11 05:15:07', NULL, NULL, NULL, NULL, NULL, NULL),
('game-001', 'PUBG Mobile Pro Tournament', 'Competitive PUBG Mobile championship with ???10 lakh prize pool. Professional gaming tournaments.', '2025-01-22', '10:00 AM', 'Gaming Arena, E-Sports Hub, Kochi', 'Ernakulam', 'https://maps.google.com/gaming-arena-kochi', 'Free', 1, '???10,00,000 in prizes and trophy', 'pubg@eventhall.com', '+91-9876543250', 'https://eventhall.com/register/game-001', 'EXTERNAL', 'https://eventhall.com/register/game-001', '@pubgtournament', 'facebook.com/pubgtournament', 'youtube.com/pubgtournament', 'https://images.unsplash.com/photo-1538481143235-d726bcc3fb4d?w=800&q=80', 'PUBLISHED', 0, NULL, NULL, NULL, 'admin-1', '2025-12-11 01:46:44', '2025-12-11 02:56:20', NULL, NULL, NULL, NULL, '2025-12-11 01:46:44', 'admin-1', NULL, NULL),
('game-002', 'Counter-Strike 2 Championship', 'Professional CS2 tournament featuring top teams competing for the title. International level competition.', '2025-02-10', '09:00 AM', 'E-Sports Complex, Gaming Center, Trivandrum', 'Thiruvananthapuram', 'https://maps.google.com/esports-complex-tvpm', 'Free', 1, '???15,00,000 prize pool', 'cs2@eventhall.com', '+91-9876543251', 'https://eventhall.com/register/game-002', 'EXTERNAL', 'https://eventhall.com/register/game-002', '@cs2championship', 'facebook.com/cs2championship', 'youtube.com/cs2championship', 'https://images.unsplash.com/photo-1552820728-8ac41f1ce891?w=800&q=80', 'PUBLISHED', 0, NULL, NULL, NULL, 'admin-1', '2025-12-11 01:46:44', '2025-12-11 01:46:44', NULL, NULL, NULL, NULL, '2025-12-11 01:46:44', 'admin-1', NULL, NULL),
('game-003', 'Valorant Pro League Qualifier', 'Qualifier matches for the Valorant Pro League with emerging esports teams. Broadcast on multiple platforms.', '2025-03-05', '11:00 AM', 'Gaming Hub, Pro Arena, Kozhikode', 'Kozhikode', 'https://maps.google.com/gaming-hub-kozhikode', 'Free', 1, '???5,00,000 prizes and sponsorships', 'valorant@eventhall.com', '+91-9876543252', 'https://eventhall.com/register/game-003', 'EXTERNAL', 'https://eventhall.com/register/game-003', '@valorantleague', 'facebook.com/valorantleague', 'youtube.com/valorantleague', 'https://images.unsplash.com/photo-1538481143235-d726bcc3fb4d?w=800&q=80', 'PUBLISHED', 0, NULL, NULL, NULL, 'admin-1', '2025-12-11 01:46:44', '2025-12-11 02:56:14', NULL, NULL, NULL, NULL, '2025-12-11 01:46:44', 'admin-1', NULL, NULL),
('game-004', 'Dota 2 Grand Finals', 'Annual Dota 2 championship bringing together the best teams in India. Premier esports event.', '2025-03-30', '01:00 PM', 'Sports Arena, Gaming Stadium, Kottayam', 'Kottayam', 'https://maps.google.com/sports-arena-kottayam', 'Free', 1, '???8,00,000 prize pool', 'dota@eventhall.com', '+91-9876543253', 'https://eventhall.com/register/game-004', 'EXTERNAL', 'https://eventhall.com/register/game-004', '@dotafinals', 'facebook.com/dotafinals', 'youtube.com/dotafinals', 'https://images.unsplash.com/photo-1552820728-8ac41f1ce891?w=800&q=80', 'PUBLISHED', 0, NULL, NULL, NULL, 'admin-1', '2025-12-11 01:46:44', '2025-12-11 01:46:44', NULL, NULL, NULL, NULL, '2025-12-11 01:46:44', 'admin-1', NULL, NULL),
('game-005', 'Gaming Expo 2025', 'Expo featuring gaming tournaments, gaming gear showcases, and industry talks. VR experiences available.', '2025-04-20', '10:00 AM', 'Convention Center, Expo Hall, Thrissur', 'Thrissur', 'https://maps.google.com/convention-center-thrissur', '???500', 0, 'Entry pass and gaming merchandise', 'expo@eventhall.com', '+91-9876543254', 'https://eventhall.com/register/game-005', 'EXTERNAL', 'https://eventhall.com/register/game-005', '@gamingexpo', 'facebook.com/gamingexpo', 'youtube.com/gamingexpo', 'https://images.unsplash.com/photo-1538481143235-d726bcc3fb4d?w=800&q=80', 'PUBLISHED', 0, NULL, NULL, NULL, 'admin-1', '2025-12-11 01:46:44', '2025-12-11 02:56:18', NULL, NULL, NULL, NULL, '2025-12-11 01:46:44', 'admin-1', NULL, NULL),
('hack-001', 'Kerala Code Hackathon 2024', 'A 48-hour coding marathon for developers across Kerala. Compete, learn, and win amazing prizes! Build innovative solutions with cutting-edge technologies.', '2024-12-20', '09:00 AM', 'Tech Park, Technopark Avenue, Trivandrum', 'Thiruvananthapuram', 'https://maps.google.com/techpark-trivandrum', 'Free', 1, '???5,00,000 in prizes for winning teams', 'hackathon@eventhall.com', '+91-9876543210', 'https://eventhall.com/register/hack-001', 'EXTERNAL', 'https://eventhall.com/register/hack-001', '@keralahackathon', 'facebook.com/keralahackathon', 'youtube.com/keralahackathon', 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&q=80', 'PUBLISHED', 1, NULL, NULL, NULL, 'admin-1', '2025-12-11 01:46:44', '2025-12-11 01:46:44', NULL, NULL, NULL, NULL, '2025-12-11 01:46:44', 'admin-1', NULL, NULL),
('hack-002', 'FinTech Innovation Hackathon', 'Build the next generation of financial technology solutions. Mentorship from industry experts included. Create solutions for payments, lending, and wealth management.', '2025-01-10', '10:00 AM', 'Innovation District, Infopark, Kochi', 'Ernakulam', 'https://maps.google.com/infopark-kochi', 'Free', 1, '???10,00,000 in prizes and funding opportunity', 'fintech@eventhall.com', '+91-9876543220', 'https://eventhall.com/register/hack-002', 'EXTERNAL', 'https://eventhall.com/register/hack-002', '@fintechhackathon', 'facebook.com/fintechhackathon', 'youtube.com/fintechhackathon', 'https://edison365.com/wp-content/uploads/2022/03/How-do-hackathons-work-1024x576.png', 'PUBLISHED', 0, NULL, NULL, NULL, 'admin-1', '2025-12-11 01:46:44', '2025-12-11 03:44:48', NULL, NULL, NULL, NULL, '2025-12-11 01:46:44', 'admin-1', NULL, NULL),
('hack-003', 'AI & ML Challenge 2025', 'Develop AI solutions for real-world problems. Grand prize: ???5 lakhs and mentorship from leading tech companies. Focus areas: NLP, Computer Vision, and Predictive Analytics.', '2025-02-01', '09:46', 'Tech Hub, Technopark, Thiruvananthapuram', 'Thiruvananthapuram', 'https://maps.google.com/technopark-tvpm', 'Free', 1, '???5,00,000 in prizes, internship offers, and mentorship', 'aiml@eventhall.com', '+91-9876543221', 'https://eventhall.com/register/hack-003', 'EXTERNAL', 'https://eventhall.com/register/hack-003', 'https://instagram.com/aimlchallenge', 'https://facebook.com/aimlchallenge', 'https://youtube.com/aimlchallenge', 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=800&q=80', 'PUBLISHED', 1, NULL, NULL, NULL, 'admin-1', '2025-12-11 01:46:44', '2025-12-11 03:17:03', NULL, NULL, NULL, NULL, '2025-12-11 01:46:44', 'admin-1', NULL, NULL),
('hack-004', 'Sustainable Tech Hackathon', 'Create solutions for environmental and social challenges using technology. Build products for green energy, waste management, and climate action.', '2025-03-15', '08:00 AM', 'Green Campus, Sustainability Hub, Kottayam', 'Kottayam', 'https://maps.google.com/green-campus-kottayam', 'Free', 1, '???3,00,000 in prizes and sustainability grants', 'sustainability@eventhall.com', '+91-9876543222', 'https://eventhall.com/register/hack-004', 'EXTERNAL', 'https://eventhall.com/register/hack-004', '@sustainabletech', 'facebook.com/sustainabletech', 'youtube.com/sustainabletech', 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&q=80', 'PUBLISHED', 0, NULL, NULL, NULL, 'admin-1', '2025-12-11 01:46:44', '2025-12-11 01:46:44', NULL, NULL, NULL, NULL, '2025-12-11 01:46:44', 'admin-1', NULL, NULL),
('hack-005', 'Startup Accelerator Hackathon', 'Fast-track your startup idea with investors, mentors, and ???10 lakh seed funding opportunity. Network with VCs and angel investors.', '2025-04-05', '09:00 AM', 'Business Park, Enterprise Zone, Thrissur', 'Thrissur', 'https://maps.google.com/business-park-thrissur', 'Free', 1, '???10,00,000 seed funding, VC meetings, and mentorship', 'startup@eventhall.com', '+91-9876543223', 'https://eventhall.com/register/hack-005', 'EXTERNAL', 'https://eventhall.com/register/hack-005', '@startupaccelerator', 'facebook.com/startupaccelerator', 'youtube.com/startupaccelerator', 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&q=80', 'PUBLISHED', 1, NULL, NULL, NULL, 'admin-1', '2025-12-11 01:46:44', '2025-12-11 01:46:44', NULL, NULL, NULL, NULL, '2025-12-11 01:46:44', 'admin-1', NULL, NULL),
('kayl1h1765456805869', 'SHUTUPSALKDFJ', 'LASKDJFKSF', '2025-12-11', '19:08', 'National Institute of Technology Calicut', 'Kollam', NULL, NULL, 1, NULL, 'kadslfj@gmail.om', '2939938492', NULL, 'EXTERNAL', NULL, NULL, NULL, NULL, NULL, 'PUBLISHED', 0, NULL, NULL, NULL, 'admin-1', '2025-12-11 12:40:05', '2025-12-11 12:40:17', 'uadmin-1', '2025-12-11 12:40:17', NULL, NULL, NULL, NULL, NULL, NULL),
('music-001', 'Indie Music Festival 2025', 'Celebrate local indie artists with live performances, collaborations, and music workshops. 15+ artists performing.', '2025-01-15', '06:00 PM', 'Amphitheater, Music Venue, Kozhikode', 'Kozhikode', 'https://maps.google.com/amphitheater-kozhikode', '???1,000', 0, 'Food court and exclusive merchandise', 'music@eventhall.com', '+91-9876543214', 'https://eventhall.com/register/music-001', 'EXTERNAL', 'https://eventhall.com/register/music-001', '@indiemusicfest', 'facebook.com/indiemusicfest', 'youtube.com/indiemusicfest', 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800&q=80', 'PUBLISHED', 1, NULL, NULL, NULL, 'admin-1', '2025-12-11 01:46:44', '2025-12-11 01:46:44', NULL, NULL, NULL, NULL, '2025-12-11 01:46:44', 'admin-1', NULL, NULL),
('music-002', 'Jazz Night Live Concert', 'International and local jazz artists performing live. Cocktails and dinner available. Intimate venue setting.', '2025-02-14', '08:00 PM', 'Concert Hall, Music Lounge, Kochi', 'Ernakulam', 'https://maps.google.com/concert-hall-kochi', '???1,500', 0, 'Dinner, drinks, and program booklet', 'jazz@eventhall.com', '+91-9876543246', 'https://eventhall.com/register/music-002', 'EXTERNAL', 'https://eventhall.com/register/music-002', '@jazznight', 'facebook.com/jazznight', 'youtube.com/jazznight', 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=800&q=80', 'PUBLISHED', 0, NULL, NULL, NULL, 'admin-1', '2025-12-11 01:46:44', '2025-12-11 01:46:44', NULL, NULL, NULL, NULL, '2025-12-11 01:46:44', 'admin-1', NULL, NULL),
('music-003', 'Classical Music Recital Series', 'Performances by renowned classical musicians from Hindustani and Carnatic traditions. Online tickets available.', '2025-03-16', '07:00 PM', 'Auditorium, Concert Center, Thiruvananthapuram', 'Thiruvananthapuram', 'https://maps.google.com/auditorium-tvpm', '???800', 0, 'Program notes and light snacks', 'classical@eventhall.com', '+91-9876543247', 'https://eventhall.com/register/music-003', 'EXTERNAL', 'https://eventhall.com/register/music-003', '@classicalmusic', 'facebook.com/classicalmusic', 'youtube.com/classicalmusic', 'https://images.unsplash.com/photo-1511379938547-c1f69b13d835?w=800&q=80', 'PUBLISHED', 0, NULL, NULL, NULL, 'admin-1', '2025-12-11 01:46:44', '2025-12-11 03:05:46', NULL, NULL, NULL, NULL, '2025-12-11 01:46:44', 'admin-1', NULL, NULL),
('music-004', 'Percussion Workshop & Concert', 'Learn traditional Kerala percussion instruments. Live concert by master musicians. Hands-on experience.', '2025-04-05', '06:00 PM', 'Music Academy, Rhythm Center, Kottayam', 'Kottayam', 'https://maps.google.com/music-academy-kottayam', '???1,200', 0, 'Instrument access and concert tickets', 'percussion@eventhall.com', '+91-9876543248', 'https://eventhall.com/register/music-004', 'EXTERNAL', 'https://eventhall.com/register/music-004', '@percussionworkshop', 'facebook.com/percussionworkshop', 'youtube.com/percussionworkshop', 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800&q=80', 'PUBLISHED', 0, NULL, NULL, NULL, 'admin-1', '2025-12-11 01:46:44', '2025-12-11 01:46:44', NULL, NULL, NULL, NULL, '2025-12-11 01:46:44', 'admin-1', NULL, NULL),
('music-005', 'Summer Music Festival 2025', 'Multi-day festival featuring rock, pop, indie, and fusion music performances. International and local artists.', '2025-04-28', '05:00 PM', 'Open Air Venue, Festival Grounds, Thrissur', 'Thrissur', 'https://maps.google.com/festival-grounds-thrissur', '???2,000', 0, 'Festival pass, food court, and parking', 'summerfest@eventhall.com', '+91-9876543249', 'https://eventhall.com/register/music-005', 'EXTERNAL', 'https://eventhall.com/register/music-005', '@summermusicfest', 'facebook.com/summermusicfest', 'youtube.com/summermusicfest', 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800&q=80', 'PUBLISHED', 1, NULL, NULL, NULL, 'admin-1', '2025-12-11 01:46:44', '2025-12-11 01:46:44', NULL, NULL, NULL, NULL, '2025-12-11 01:46:44', 'admin-1', NULL, NULL),
('sem-001', 'Entrepreneurship 101 Seminar', 'Learn the basics of starting your own business from successful entrepreneurs. Business plan and pitch training included.', '2024-12-28', '03:00 PM', 'Business Club, Enterprise Hub, Trivandrum', 'Thiruvananthapuram', 'https://maps.google.com/business-club-tvpm', 'Free', 1, 'Business templates and mentor access', 'business@eventhall.com', '+91-9876543232', 'https://eventhall.com/register/sem-001', 'EXTERNAL', 'https://eventhall.com/register/sem-001', '@entrepreneurship', 'facebook.com/entrepreneurship', 'youtube.com/entrepreneurship', 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&q=80', 'PUBLISHED', 0, NULL, NULL, NULL, 'admin-1', '2025-12-11 01:46:44', '2025-12-11 01:46:44', NULL, NULL, NULL, NULL, '2025-12-11 01:46:44', 'admin-1', NULL, NULL),
('sem-002', 'Career Development Seminar', 'Expert advice on career planning, job search strategies, and professional growth. Resume and interview coaching.', '2025-01-25', '02:00 PM', 'Career Center, Education Hub, Kottayam', 'Kottayam', 'https://maps.google.com/career-center-kottayam', 'Free', 1, 'Resume review and job board access', 'career@eventhall.com', '+91-9876543233', 'https://eventhall.com/register/sem-002', 'EXTERNAL', 'https://eventhall.com/register/sem-002', '@careerseminar', 'facebook.com/careerseminar', 'youtube.com/careerseminar', 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&q=80', 'PUBLISHED', 1, NULL, NULL, NULL, 'admin-1', '2025-12-11 01:46:44', '2025-12-11 01:46:44', NULL, NULL, NULL, NULL, '2025-12-11 01:46:44', 'admin-1', NULL, NULL),
('sem-003', 'Data Science for Everyone', 'Introduction to data science, analytics, and data-driven decision making. No prerequisites required.', '2025-02-22', '03:00 PM', 'Analytics Hub, Data Center, Kochi', 'Ernakulam', 'https://maps.google.com/analytics-hub-kochi', '???1,999', 0, 'Datasets and Python notebooks included', 'datascience@eventhall.com', '+91-9876543234', 'https://eventhall.com/register/sem-003', 'EXTERNAL', 'https://eventhall.com/register/sem-003', '@datasciencesem', 'facebook.com/datasciencesem', 'youtube.com/datasciencesem', 'https://images.unsplash.com/photo-1460925895917-adf4e566c039?w=800&q=80', 'PUBLISHED', 0, NULL, NULL, NULL, 'admin-1', '2025-12-11 01:46:44', '2025-12-11 01:46:44', NULL, NULL, NULL, NULL, '2025-12-11 01:46:44', 'admin-1', NULL, NULL),
('sem-004', 'Personal Finance & Investment Seminar', 'Master personal finance, investments, and wealth management for your future. Stock market and mutual fund training.', '2025-03-25', '02:00 PM', 'Finance Club, Investment Center, Kozhikode', 'Kozhikode', 'https://maps.google.com/finance-club-kozhikode', 'Free', 1, 'Investment guides and portfolio templates', 'finance@eventhall.com', '+91-9876543235', 'https://eventhall.com/register/sem-004', 'EXTERNAL', 'https://eventhall.com/register/sem-004', '@financeseminar', 'facebook.com/financeseminar', 'youtube.com/financeseminar', 'https://images.unsplash.com/photo-1552821206-7f0a784c21f4?w=800&q=80', 'PUBLISHED', 0, NULL, NULL, NULL, 'admin-1', '2025-12-11 01:46:44', '2025-12-11 02:56:04', NULL, NULL, NULL, NULL, '2025-12-11 01:46:44', 'admin-1', NULL, NULL),
('sem-005', 'Environmental Sustainability Seminar', 'Explore sustainable practices and their impact on business and society. ESG and green business strategies.', '2025-04-22', '03:00 PM', 'Green Institute, Eco Center, Thrissur', 'Thrissur', 'https://maps.google.com/green-institute-thrissur', 'Free', 1, 'Sustainability toolkit and certification', 'green@eventhall.com', '+91-9876543236', 'https://eventhall.com/register/sem-005', 'EXTERNAL', 'https://eventhall.com/register/sem-005', '@sustainability', 'facebook.com/sustainability', 'youtube.com/sustainability', 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&q=80', 'PUBLISHED', 0, NULL, NULL, NULL, 'admin-1', '2025-12-11 01:46:44', '2025-12-11 01:46:44', NULL, NULL, NULL, NULL, '2025-12-11 01:46:44', 'admin-1', NULL, NULL),
('sport-001', 'Annual Sports Day Championship', 'Multi-sport event featuring cricket, badminton, volleyball, and athletics. Team registration and prizes.', '2025-01-05', '07:00 AM', 'Sports Complex, Athletic Hub, Thrissur', 'Thrissur', 'https://maps.google.com/sports-complex-thrissur', 'Free', 1, '???2,00,000 in prizes and trophies', 'sports@eventhall.com', '+91-9876543213', 'https://eventhall.com/register/sport-001', 'EXTERNAL', 'https://eventhall.com/register/sport-001', '@sportschampionship', 'facebook.com/sportschampionship', 'youtube.com/sportschampionship', 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&q=80', 'PUBLISHED', 0, NULL, NULL, NULL, 'admin-1', '2025-12-11 01:46:44', '2025-12-11 01:46:44', NULL, NULL, NULL, NULL, '2025-12-11 01:46:44', 'admin-1', NULL, NULL),
('sport-002', 'Marathon 2025 - Run for Health', 'Half marathon and full marathon events promoting health and fitness awareness. All ages welcome.', '2025-02-09', '06:00 AM', 'Beach Road, Coastal Path, Thiruvananthapuram', 'Thiruvananthapuram', 'https://maps.google.com/beach-road-tvpm', '???500', 0, 'Medal, T-shirt, and refreshments', 'marathon@eventhall.com', '+91-9876543237', 'https://eventhall.com/register/sport-002', 'EXTERNAL', 'https://eventhall.com/register/sport-002', '@marathon2025', 'facebook.com/marathon2025', 'youtube.com/marathon2025', 'https://images.unsplash.com/photo-1552821206-7f0a784c21f4?w=800&q=80', 'PUBLISHED', 0, NULL, NULL, NULL, 'admin-1', '2025-12-11 01:46:44', '2025-12-11 02:56:07', NULL, NULL, NULL, NULL, '2025-12-11 01:46:44', 'admin-1', NULL, NULL),
('sport-003', 'Badminton Premier League', 'Professional badminton tournament with teams competing for championship title. Premier player participation.', '2025-03-01', '10:00 AM', 'Indoor Arena, Sports Hub, Kochi', 'Ernakulam', 'https://maps.google.com/indoor-arena-kochi', 'Free', 1, '???5,00,000 prize pool', 'badminton@eventhall.com', '+91-9876543238', 'https://eventhall.com/register/sport-003', 'EXTERNAL', 'https://eventhall.com/register/sport-003', '@badmintonpremier', 'facebook.com/badmintonpremier', 'youtube.com/badmintonpremier', 'https://images.unsplash.com/photo-1461414325433-e0da6e8b08a8?w=800&q=80', 'PUBLISHED', 0, NULL, NULL, NULL, 'admin-1', '2025-12-11 01:46:44', '2025-12-11 01:46:44', NULL, NULL, NULL, NULL, '2025-12-11 01:46:44', 'admin-1', NULL, NULL),
('sport-004', 'Cricket T20 Tournament', 'Exciting T20 cricket tournament for teams across Kerala. Prize pool: ???5 lakhs. Professional umpires.', '2025-03-28', '09:00 AM', 'Cricket Ground, Cricket Stadium, Kottayam', 'Kottayam', 'https://maps.google.com/cricket-ground-kottayam', 'Free', 1, '???5,00,000 in prizes and trophies', 'cricket@eventhall.com', '+91-9876543239', 'https://eventhall.com/register/sport-004', 'EXTERNAL', 'https://eventhall.com/register/sport-004', '@cricketseries', 'facebook.com/cricketseries', 'youtube.com/cricketseries', 'https://images.unsplash.com/photo-1461412653827-3f228ba1cb14?w=800&q=80', 'PUBLISHED', 0, NULL, NULL, NULL, 'admin-1', '2025-12-11 01:46:44', '2025-12-11 02:55:59', NULL, NULL, NULL, NULL, '2025-12-11 01:46:44', 'admin-1', NULL, NULL),
('sport-005', 'Volleyball Championship League', 'State-level volleyball championship featuring men\'s and women\'s divisions. Professional coaching and referees.', '2025-04-12', '08:00 AM', 'Sports Stadium, Volleyball Center, Kozhikode', 'Kozhikode', 'https://maps.google.com/sports-stadium-kozhikode', 'Free', 1, '???1,00,000 in prizes', 'volleyball@eventhall.com', '+91-9876543240', 'https://eventhall.com/register/sport-005', 'EXTERNAL', 'https://eventhall.com/register/sport-005', '@volleyballchamp', 'facebook.com/volleyballchamp', 'youtube.com/volleyballchamp', 'https://images.unsplash.com/photo-1461412653827-3f228ba1cb14?w=800&q=80', 'PUBLISHED', 0, NULL, NULL, NULL, 'admin-1', '2025-12-11 01:46:44', '2025-12-11 01:46:44', NULL, NULL, NULL, NULL, '2025-12-11 01:46:44', 'admin-1', NULL, NULL),
('ws-001', 'Advanced React Workshop', 'Learn advanced React concepts including hooks, context API, and performance optimization. Perfect for intermediate developers.', '2024-12-22', '02:00 PM', 'Innovation Hub, Tech Center, Kochi', 'Ernakulam', 'https://maps.google.com/innovation-hub-kochi', '???2,999', 0, 'Certificate of completion included', 'workshops@eventhall.com', '+91-9876543211', 'https://eventhall.com/register/ws-001', 'EXTERNAL', 'https://eventhall.com/register/ws-001', '@reactworkshop', 'facebook.com/reactworkshop', 'youtube.com/reactworkshop', 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&q=80', 'PUBLISHED', 0, NULL, NULL, NULL, 'admin-1', '2025-12-11 01:46:44', '2025-12-11 01:46:44', NULL, NULL, NULL, NULL, '2025-12-11 01:46:44', 'admin-1', NULL, NULL),
('ws-002', 'Full-Stack Web Development Bootcamp', 'Master frontend and backend technologies. Project-based learning with real-world applications. 8-week intensive program.', '2025-01-12', '10:00 AM', 'Tech Academy, Developer Hub, Kozhikode', 'Kozhikode', 'https://maps.google.com/tech-academy-kozhikode', '???9,999', 0, 'Job placement assistance and lifetime access to materials', 'fullstack@eventhall.com', '+91-9876543224', 'https://eventhall.com/register/ws-002', 'EXTERNAL', 'https://eventhall.com/register/ws-002', '@fullstackbootcamp', 'facebook.com/fullstackbootcamp', 'youtube.com/fullstackbootcamp', 'https://images.unsplash.com/photo-1633356715463-ce4b9b8b7ce9?w=800&q=80', 'PUBLISHED', 0, NULL, NULL, NULL, 'admin-1', '2025-12-11 01:46:44', '2025-12-11 02:56:02', NULL, NULL, NULL, NULL, '2025-12-11 01:46:44', 'admin-1', NULL, NULL),
('ws-003', 'Cloud Computing with AWS', 'Comprehensive workshop on AWS services, deployment, and infrastructure management. Hands-on labs and real project scenarios.', '2025-02-08', '09:00 AM', 'Cloud Center, AWS Partner Hub, Ernakulam', 'Ernakulam', 'https://maps.google.com/cloud-center-ernakulam', '???4,999', 0, 'AWS certification exam voucher included', 'cloud@eventhall.com', '+91-9876543225', 'https://eventhall.com/register/ws-003', 'EXTERNAL', 'https://eventhall.com/register/ws-003', '@awsworkshop', 'facebook.com/awsworkshop', 'youtube.com/awsworkshop', 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&q=80', 'PUBLISHED', 0, NULL, NULL, NULL, 'admin-1', '2025-12-11 01:46:44', '2025-12-11 01:46:44', NULL, NULL, NULL, NULL, '2025-12-11 01:46:44', 'admin-1', NULL, NULL),
('ws-004', 'Mobile App Development with Flutter', 'Build cross-platform mobile apps using Flutter. Hands-on coding from day one. Create iOS and Android apps simultaneously.', '2025-03-20', '02:00 PM', 'Dev Studio, Mobile Lab, Trivandrum', 'Thiruvananthapuram', 'https://maps.google.com/dev-studio-tvpm', '???3,499', 0, 'Source code access and mentorship for 3 months', 'flutter@eventhall.com', '+91-9876543226', 'https://eventhall.com/register/ws-004', 'EXTERNAL', 'https://eventhall.com/register/ws-004', '@flutterworkshop', 'facebook.com/flutterworkshop', 'youtube.com/flutterworkshop', 'https://images.unsplash.com/photo-1512941691920-25bda36cf6dd?w=800&q=80', 'PUBLISHED', 0, NULL, NULL, NULL, 'admin-1', '2025-12-11 01:46:44', '2025-12-11 02:55:56', NULL, NULL, NULL, NULL, '2025-12-11 01:46:44', 'admin-1', NULL, NULL),
('ws-005', 'Cybersecurity Essentials Workshop', 'Learn to secure applications and infrastructure. Ethical hacking fundamentals included. Hands-on labs with real scenarios.', '2025-04-10', '10:00 AM', 'Security Lab, Defense Hub, Kottayam', 'Kottayam', 'https://maps.google.com/security-lab-kottayam', '???5,999', 0, 'Security certification and pentesting toolkit', 'security@eventhall.com', '+91-9876543227', 'https://eventhall.com/register/ws-005', 'EXTERNAL', 'https://eventhall.com/register/ws-005', '@cybersecurityws', 'facebook.com/cybersecurityws', 'youtube.com/cybersecurityws', 'https://images.unsplash.com/photo-1555949519-2f4a95dc5285?w=800&q=80', 'PUBLISHED', 0, NULL, NULL, NULL, 'admin-1', '2025-12-11 01:46:44', '2025-12-11 01:46:44', NULL, NULL, NULL, NULL, '2025-12-11 01:46:44', 'admin-1', NULL, NULL),
('xt9xb1765428398624', 'Test01', 'something in the way ', '2025-12-12', '11:12', '13.0328, 74.7887', 'Thiruvananthapuram', NULL, '799', 0, '1st price : 299', 'askldfj@gmail.com', '1239821938', NULL, 'EXTERNAL', NULL, NULL, NULL, NULL, 'https://i.ibb.co/FqHR7q0L/Screenshot-2025-12-04-191404.png', 'PUBLISHED', 0, NULL, NULL, NULL, 'admin-1', '2025-12-11 04:46:38', '2025-12-11 05:24:41', 'uadmin-1', '2025-12-11 05:00:42', NULL, NULL, NULL, NULL, NULL, NULL),
('zruh7c1765459735749', 'chumbik', 'kumbiakd', '2025-12-18', '18:01', 'Vallabhipur Taluka', 'Thiruvananthapuram', NULL, NULL, 1, NULL, 'comsd@gmail.com1', '2312321312', NULL, 'FORM', NULL, NULL, NULL, NULL, NULL, 'PUBLISHED', 0, NULL, NULL, NULL, 'admin-1', '2025-12-11 13:28:55', '2025-12-11 13:29:10', 'uadmin-1', '2025-12-11 13:29:10', NULL, NULL, NULL, NULL, NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `event_assets`
--

CREATE TABLE `event_assets` (
  `id` int(11) NOT NULL,
  `event_id` varchar(255) NOT NULL,
  `asset_type` enum('BROCHURE','POSTER','SOCIAL') NOT NULL,
  `name` varchar(500) DEFAULT NULL,
  `url` varchar(1000) NOT NULL,
  `label` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `event_assets`
--

INSERT INTO `event_assets` (`id`, `event_id`, `asset_type`, `name`, `url`, `label`, `created_at`) VALUES
(1, 'xt9xb1765428398624', 'BROCHURE', 'VoC_Survey_Summary.pdf', 'blob:http://localhost:5173/0a881105-c2b0-418c-b758-d40e0c5032ed', NULL, '2025-12-11 05:42:09'),
(2, 'xt9xb1765428398624', 'BROCHURE', 'event_ticket_575737.pdf', 'blob:http://localhost:5173/386e315c-2b5d-4cdc-977e-0238c9abb3df', NULL, '2025-12-11 05:42:09'),
(3, 'xt9xb1765428398624', 'POSTER', 'Screenshot 2025-12-04 191404.png', 'https://i.ibb.co/FqHR7q0L/Screenshot-2025-12-04-191404.png', NULL, '2025-12-11 05:42:09'),
(4, 'xt9xb1765428398624', 'POSTER', 'Screenshot 2025-12-04 193741.png', 'https://i.ibb.co/LDrPCkY6/Screenshot-2025-12-04-193741.png', NULL, '2025-12-11 05:42:09'),
(5, 'xt9xb1765428398624', 'POSTER', 'Screenshot 2025-12-04 193947.png', 'https://i.ibb.co/p6QDxd3s/Screenshot-2025-12-04-193947.png', NULL, '2025-12-11 05:42:09'),
(6, 'xt9xb1765428398624', 'POSTER', 'Screenshot 2025-12-04 194220.png', 'https://i.ibb.co/JWW7BwyR/Screenshot-2025-12-04-194220.png', NULL, '2025-12-11 05:42:09'),
(7, 'xt9xb1765428398624', 'POSTER', 'Screenshot 2025-12-05 150625.png', 'https://i.ibb.co/jPr8Jy6Y/Screenshot-2025-12-05-150625.png', NULL, '2025-12-11 05:42:09'),
(8, 'xt9xb1765428398624', 'POSTER', 'Screenshot 2025-12-05 172429.png', 'https://i.ibb.co/r2L83XCb/Screenshot-2025-12-05-172429.png', NULL, '2025-12-11 05:42:09'),
(9, 'xt9xb1765428398624', 'SOCIAL', NULL, 'https://www.youtube.com/playlist?list=PLMiqWx4QEydGzCm2TxliuLUoqNuvX9NSM', NULL, '2025-12-11 05:42:09'),
(10, 'xt9xb1765428398624', 'SOCIAL', NULL, 'https://www.instagram.com/ranjicollins/', NULL, '2025-12-11 05:42:09'),
(11, 'xt9xb1765428398624', 'SOCIAL', NULL, 'https://www.facebook.com/Wisdomislamicyouth/videos/56-%E0%B4%95%E0%B4%A3%E0%B5%8D%E0%B4%A3%E0%B5%81%E0%B4%95%E0%B4%B3%E0%B5%81%E0%B4%B3%E0%B5%8D%E0%B4%B3-%E0%B4%AE%E0%B4%BE%E0%B4%B7%E0%B5%8D-kerala-teachers-conference-2024-perinthalmanna/947828207155454/', NULL, '2025-12-11 05:42:09');

-- --------------------------------------------------------

--
-- Table structure for table `event_categories`
--

CREATE TABLE `event_categories` (
  `id` varchar(255) NOT NULL,
  `name` varchar(255) NOT NULL,
  `slug` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `event_categories`
--

INSERT INTO `event_categories` (`id`, `name`, `slug`, `description`, `created_at`, `updated_at`) VALUES
('1', 'Hackathons', 'hackathons', 'Coding competitions and marathons', '2025-12-11 00:48:55', '2025-12-11 00:48:55'),
('2', 'Workshops', 'workshops', 'Technical and skill-building workshops', '2025-12-11 00:48:55', '2025-12-11 00:48:55'),
('3', 'Conferences', 'conferences', 'Tech talks and conferences', '2025-12-11 00:48:55', '2025-12-11 00:48:55'),
('4', 'Seminars', 'seminars', 'Expert seminars and lectures', '2025-12-11 00:48:55', '2025-12-11 00:48:55'),
('5', 'Sports', 'sports', 'Sports events and competitions', '2025-12-11 00:48:55', '2025-12-11 00:48:55'),
('6', 'Cultural', 'cultural', 'Cultural programs and performances', '2025-12-11 00:48:55', '2025-12-11 00:48:55'),
('7', 'Music & Arts', 'music-arts', 'Music concerts and art exhibitions', '2025-12-11 00:48:55', '2025-12-11 00:48:55'),
('8', 'Gaming', 'gaming', 'Gaming tournaments and esports', '2025-12-11 00:48:55', '2025-12-11 00:48:55');

-- --------------------------------------------------------

--
-- Table structure for table `event_category_links`
--

CREATE TABLE `event_category_links` (
  `id` int(11) NOT NULL,
  `event_id` varchar(255) NOT NULL,
  `category_id` varchar(255) NOT NULL,
  `is_primary` tinyint(1) DEFAULT 0,
  `primary_event_id` varchar(255) GENERATED ALWAYS AS (case when `is_primary` then `event_id` end) STORED,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `event_category_links`
--

INSERT INTO `event_category_links` (`id`, `event_id`, `category_id`, `is_primary`, `created_at`) VALUES
(1, 'e83nu51765430086915', '1', 1, '2025-12-11 05:36:40'),
(2, 'hack-001', '1', 1, '2025-12-11 05:36:40'),
(3, 'hack-002', '1', 1, '2025-12-11 05:36:40'),
(4, 'hack-003', '1', 1, '2025-12-11 05:36:40'),
(5, 'hack-004', '1', 1, '2025-12-11 05:36:40'),
(6, 'hack-005', '1', 1, '2025-12-11 05:36:40'),
(7, 'xt9xb1765428398624', '1', 1, '2025-12-11 05:36:40'),
(8, 'ws-001', '2', 1, '2025-12-11 05:36:40'),
(9, 'ws-002', '2', 1, '2025-12-11 05:36:40'),
(10, 'ws-003', '2', 1, '2025-12-11 05:36:40'),
(11, 'ws-004', '2', 1, '2025-12-11 05:36:40'),
(12, 'ws-005', '2', 1, '2025-12-11 05:36:40'),
(14, 'conf-002', '3', 1, '2025-12-11 05:36:40'),
(16, 'conf-004', '3', 1, '2025-12-11 05:36:40'),
(17, 'conf-005', '3', 1, '2025-12-11 05:36:40'),
(18, 'sem-001', '4', 1, '2025-12-11 05:36:40'),
(19, 'sem-002', '4', 1, '2025-12-11 05:36:40'),
(20, 'sem-003', '4', 1, '2025-12-11 05:36:40'),
(21, 'sem-004', '4', 1, '2025-12-11 05:36:40'),
(22, 'sem-005', '4', 1, '2025-12-11 05:36:40'),
(23, 'sport-001', '5', 1, '2025-12-11 05:36:40'),
(24, 'sport-002', '5', 1, '2025-12-11 05:36:40'),
(25, 'sport-003', '5', 1, '2025-12-11 05:36:40'),
(26, 'sport-004', '5', 1, '2025-12-11 05:36:40'),
(27, 'sport-005', '5', 1, '2025-12-11 05:36:40'),
(28, 'cult-001', '6', 1, '2025-12-11 05:36:40'),
(29, 'cult-002', '6', 1, '2025-12-11 05:36:40'),
(30, 'cult-003', '6', 1, '2025-12-11 05:36:40'),
(31, 'cult-004', '6', 1, '2025-12-11 05:36:40'),
(32, 'cult-005', '6', 1, '2025-12-11 05:36:40'),
(33, 'music-001', '7', 1, '2025-12-11 05:36:40'),
(34, 'music-002', '7', 1, '2025-12-11 05:36:40'),
(35, 'music-003', '7', 1, '2025-12-11 05:36:40'),
(36, 'music-004', '7', 1, '2025-12-11 05:36:40'),
(37, 'music-005', '7', 1, '2025-12-11 05:36:40'),
(38, 'game-001', '8', 1, '2025-12-11 05:36:40'),
(39, 'game-002', '8', 1, '2025-12-11 05:36:40'),
(40, 'game-003', '8', 1, '2025-12-11 05:36:40'),
(41, 'game-004', '8', 1, '2025-12-11 05:36:40'),
(42, 'game-005', '8', 1, '2025-12-11 05:36:40'),
(43, 'e83nu51765430086915', '2', 0, '2025-12-11 05:36:40'),
(44, 'e83nu51765430086915', '6', 0, '2025-12-11 05:36:40'),
(45, 'e83nu51765430086915', '7', 0, '2025-12-11 05:36:40'),
(46, 'xt9xb1765428398624', '2', 0, '2025-12-11 05:36:40'),
(47, 'xt9xb1765428398624', '7', 0, '2025-12-11 05:36:40'),
(50, 'conf-003', '3', 1, '2025-12-11 12:06:42'),
(51, 'conf-001', '3', 1, '2025-12-11 12:06:49'),
(53, 'kayl1h1765456805869', '1', 1, '2025-12-11 12:40:05'),
(54, 'kayl1h1765456805869', '8', 0, '2025-12-11 12:40:05'),
(55, 'kayl1h1765456805869', '7', 0, '2025-12-11 12:40:05'),
(56, 'kayl1h1765456805869', '4', 0, '2025-12-11 12:40:05'),
(67, '5a89wm1765456362587', '2', 1, '2025-12-11 13:27:24'),
(70, 'zruh7c1765459735749', '1', 1, '2025-12-11 13:33:54'),
(71, 'zruh7c1765459735749', '6', 0, '2025-12-11 13:33:54');

-- --------------------------------------------------------

--
-- Table structure for table `event_likes`
--

CREATE TABLE `event_likes` (
  `id` varchar(255) NOT NULL,
  `user_id` varchar(255) NOT NULL,
  `event_id` varchar(255) NOT NULL,
  `deleted` tinyint(1) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `event_likes`
--

INSERT INTO `event_likes` (`id`, `user_id`, `event_id`, `deleted`, `created_at`, `deleted_at`) VALUES
('admin-1_hack-001', 'admin-1', 'hack-001', 1, '2025-12-11 01:50:44', '2025-12-11 01:51:37'),
('admin-1_hack-002', 'admin-1', 'hack-002', 1, '2025-12-11 01:50:43', '2025-12-11 01:51:36'),
('admin-1_hack-004', 'admin-1', 'hack-004', 0, '2025-12-11 01:51:33', NULL),
('admin-1_hack-005', 'admin-1', 'hack-005', 1, '2025-12-11 01:51:21', '2025-12-11 01:51:34');

-- --------------------------------------------------------

--
-- Table structure for table `event_registrations`
--

CREATE TABLE `event_registrations` (
  `id` varchar(255) NOT NULL,
  `user_id` varchar(255) NOT NULL,
  `event_id` varchar(255) NOT NULL,
  `registration_type` enum('EXTERNAL','FORM') DEFAULT 'EXTERNAL',
  `status` enum('PENDING','APPROVED','REJECTED') DEFAULT 'PENDING',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `event_registrations`
--

INSERT INTO `event_registrations` (`id`, `user_id`, `event_id`, `registration_type`, `status`, `created_at`) VALUES
('admin-1_hack-002', 'admin-1', 'hack-002', 'EXTERNAL', 'PENDING', '2025-12-11 11:51:49'),
('uadmin-1_zruh7c1765459735749', 'uadmin-1', 'zruh7c1765459735749', 'FORM', 'PENDING', '2025-12-11 13:57:31');

-- --------------------------------------------------------

--
-- Table structure for table `registration_form_questions`
--

CREATE TABLE `registration_form_questions` (
  `id` varchar(255) NOT NULL,
  `event_id` varchar(255) NOT NULL,
  `question_category` varchar(100) NOT NULL,
  `question_key` varchar(255) NOT NULL,
  `question_text` varchar(500) NOT NULL,
  `question_type` enum('text','email','dropdown','textarea','url','yes/no','multi-select') DEFAULT 'text',
  `options` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`options`)),
  `is_required` tinyint(1) DEFAULT 0,
  `display_order` int(11) DEFAULT 0,
  `is_custom` tinyint(1) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `registration_form_questions`
--

INSERT INTO `registration_form_questions` (`id`, `event_id`, `question_category`, `question_key`, `question_text`, `question_type`, `options`, `is_required`, `display_order`, `is_custom`, `created_at`, `updated_at`) VALUES
('01659eff-0a8a-4408-8349-b22277ba1f37', 'zruh7c1765459735749', 'Basic Participant Information', 'institution', 'Which institution/college are you from?', 'text', NULL, 0, 3, 0, '2025-12-11 13:33:54', '2025-12-11 13:33:54'),
('819256c5-0fb4-4a29-a58c-db9a217a9008', 'zruh7c1765459735749', 'Basic Participant Information', 'email', 'What is your email address?', 'email', NULL, 0, 1, 0, '2025-12-11 13:33:54', '2025-12-11 13:33:54'),
('8d8c64e4-995f-47ba-9d00-02c81abd5f52', 'zruh7c1765459735749', 'Basic Participant Information', 'department', 'What is your department/field of study?', 'text', NULL, 0, 4, 0, '2025-12-11 13:33:54', '2025-12-11 13:33:54'),
('966b225a-59fa-40c9-8a0c-af3f4561d530', '5a89wm1765456362587', 'Basic Participant Information', 'email', 'What is your email address?', 'email', NULL, 0, 1, 0, '2025-12-11 13:27:24', '2025-12-11 13:27:24'),
('966cfacb-56a5-4ae6-abec-a0581715002f', '5a89wm1765456362587', 'Basic Participant Information', 'fullName', 'What is your full name?', 'text', NULL, 0, 0, 0, '2025-12-11 13:27:24', '2025-12-11 13:27:24'),
('b09f763c-5a02-49e5-b10d-865fa294cfdf', 'zruh7c1765459735749', 'Basic Participant Information', 'phone', 'What is your phone number?', 'text', NULL, 0, 2, 0, '2025-12-11 13:33:54', '2025-12-11 13:33:54'),
('be0d75cd-fc59-4634-9116-12efe5290d36', 'zruh7c1765459735749', 'Basic Participant Information', 'fullName', 'What is your full name?', 'text', NULL, 0, 0, 0, '2025-12-11 13:33:54', '2025-12-11 13:33:54');

-- --------------------------------------------------------

--
-- Table structure for table `registration_form_responses`
--

CREATE TABLE `registration_form_responses` (
  `id` varchar(255) NOT NULL,
  `registration_id` varchar(255) NOT NULL,
  `event_id` varchar(255) NOT NULL,
  `user_id` varchar(255) NOT NULL,
  `question_id` varchar(255) NOT NULL,
  `answer` longtext DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `registration_form_responses`
--

INSERT INTO `registration_form_responses` (`id`, `registration_id`, `event_id`, `user_id`, `question_id`, `answer`, `created_at`, `updated_at`) VALUES
('513069c6-6dc9-4888-88cf-3bcf2b33ac59', 'uadmin-1_zruh7c1765459735749', 'zruh7c1765459735749', 'uadmin-1', '01659eff-0a8a-4408-8349-b22277ba1f37', 'kannur Uni', '2025-12-11 13:57:31', '2025-12-11 13:57:31'),
('68a7a502-abf7-45b5-9ca9-904898d796be', 'uadmin-1_zruh7c1765459735749', 'zruh7c1765459735749', 'uadmin-1', 'b09f763c-5a02-49e5-b10d-865fa294cfdf', '1231232131', '2025-12-11 13:57:31', '2025-12-11 13:57:31'),
('75858994-ef41-4d50-8b35-f353e3598fd7', 'uadmin-1_zruh7c1765459735749', 'zruh7c1765459735749', 'uadmin-1', 'be0d75cd-fc59-4634-9116-12efe5290d36', 'sah', '2025-12-11 13:57:31', '2025-12-11 13:57:31'),
('82c06203-e190-46a5-aaff-05fd8ebc31f2', 'uadmin-1_zruh7c1765459735749', 'zruh7c1765459735749', 'uadmin-1', '819256c5-0fb4-4a29-a58c-db9a217a9008', 'sh@gmail.com', '2025-12-11 13:57:31', '2025-12-11 13:57:31'),
('843e4b02-db69-4142-85e1-16735c52eb15', 'uadmin-1_zruh7c1765459735749', 'zruh7c1765459735749', 'uadmin-1', '8d8c64e4-995f-47ba-9d00-02c81abd5f52', 'IT DEPT', '2025-12-11 13:57:31', '2025-12-11 13:57:31');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` varchar(255) NOT NULL,
  `username` varchar(100) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `firebase_uid` varchar(255) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `full_name` varchar(255) NOT NULL,
  `photo_url` varchar(500) DEFAULT NULL,
  `role` enum('STANDARD_USER','EVENT_ADMIN','ULTIMATE_ADMIN','GUEST') DEFAULT 'STANDARD_USER',
  `is_student` tinyint(1) DEFAULT NULL,
  `college_name` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `username`, `password_hash`, `firebase_uid`, `email`, `full_name`, `photo_url`, `role`, `is_student`, `college_name`, `created_at`, `updated_at`) VALUES
('admin-1', 'admin', '240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9', NULL, 'admin@example.com', 'Admin', NULL, 'EVENT_ADMIN', 1, 'admin school', '2025-12-11 00:48:55', '2025-12-11 01:22:54'),
('uadmin-1', 'uadmin', 'bc585d492a6396d310cc0a49060c6ef5101a91c371495d399edb766dff3d5d8a', NULL, 'uadmin@example.com', 'Ultimate Admin', NULL, 'ULTIMATE_ADMIN', 1, 'UADMIN', '2025-12-11 00:48:55', '2025-12-11 01:52:50'),
('user-1', 'user', 'e606e38b0d8c19b24cf0ee3808183162ea7cd63ff7912dbb22b5e803286b4446', NULL, 'user@example.com', 'User', NULL, 'STANDARD_USER', NULL, NULL, '2025-12-11 00:48:55', '2025-12-11 00:48:55');

-- --------------------------------------------------------

--
-- Table structure for table `user_interests`
--

CREATE TABLE `user_interests` (
  `id` int(11) NOT NULL,
  `user_id` varchar(255) NOT NULL,
  `category_id` varchar(255) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `user_interests`
--

INSERT INTO `user_interests` (`id`, `user_id`, `category_id`, `created_at`) VALUES
(10, 'uadmin-1', '2', '2025-12-11 01:52:50'),
(11, 'admin-1', '1', '2025-12-11 03:47:01'),
(12, 'admin-1', '3', '2025-12-11 03:47:01');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `admin_applications`
--
ALTER TABLE `admin_applications`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_status` (`status`),
  ADD KEY `idx_user_id` (`user_id`),
  ADD KEY `idx_reviewed_by` (`reviewed_by_user_id`);

--
-- Indexes for table `events`
--
ALTER TABLE `events`
  ADD PRIMARY KEY (`id`),
  ADD KEY `featured_by` (`featured_by`),
  ADD KEY `reviewed_by` (`reviewed_by`),
  ADD KEY `archived_by` (`archived_by`),
  ADD KEY `idx_status` (`status`),
  ADD KEY `idx_created_by` (`created_by_id`),
  ADD KEY `idx_is_featured` (`is_featured`),
  ADD KEY `idx_date` (`date`),
  ADD KEY `idx_district` (`district`);

--
-- Indexes for table `event_assets`
--
ALTER TABLE `event_assets`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_event_id` (`event_id`),
  ADD KEY `idx_asset_type` (`asset_type`);

--
-- Indexes for table `event_categories`
--
ALTER TABLE `event_categories`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `name` (`name`),
  ADD UNIQUE KEY `slug` (`slug`),
  ADD KEY `idx_slug` (`slug`);

--
-- Indexes for table `event_category_links`
--
ALTER TABLE `event_category_links`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_event_category` (`event_id`,`category_id`),
  ADD UNIQUE KEY `unique_primary_category` (`primary_event_id`),
  ADD KEY `idx_event_id` (`event_id`),
  ADD KEY `idx_category_id` (`category_id`),
  ADD KEY `idx_is_primary` (`is_primary`);

--
-- Indexes for table `event_likes`
--
ALTER TABLE `event_likes`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_user_event_like` (`user_id`,`event_id`),
  ADD KEY `idx_user_id` (`user_id`),
  ADD KEY `idx_event_id` (`event_id`),
  ADD KEY `idx_deleted` (`deleted`);

--
-- Indexes for table `event_registrations`
--
ALTER TABLE `event_registrations`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_user_event_registration` (`user_id`,`event_id`),
  ADD KEY `idx_user_id` (`user_id`),
  ADD KEY `idx_event_id` (`event_id`);

--
-- Indexes for table `registration_form_questions`
--
ALTER TABLE `registration_form_questions`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_event_question` (`event_id`,`question_key`),
  ADD KEY `idx_event_id` (`event_id`),
  ADD KEY `idx_question_category` (`question_category`);

--
-- Indexes for table `registration_form_responses`
--
ALTER TABLE `registration_form_responses`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_registration_id` (`registration_id`),
  ADD KEY `idx_question_id` (`question_id`),
  ADD KEY `event_id` (`event_id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `username` (`username`),
  ADD UNIQUE KEY `email` (`email`),
  ADD KEY `idx_email` (`email`),
  ADD KEY `idx_username` (`username`);

--
-- Indexes for table `user_interests`
--
ALTER TABLE `user_interests`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_user_category` (`user_id`,`category_id`),
  ADD KEY `idx_user_id` (`user_id`),
  ADD KEY `idx_category_id` (`category_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `event_assets`
--
ALTER TABLE `event_assets`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- AUTO_INCREMENT for table `event_category_links`
--
ALTER TABLE `event_category_links`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=72;

--
-- AUTO_INCREMENT for table `user_interests`
--
ALTER TABLE `user_interests`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `admin_applications`
--
ALTER TABLE `admin_applications`
  ADD CONSTRAINT `admin_applications_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `admin_applications_ibfk_2` FOREIGN KEY (`reviewed_by_user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `events`
--
ALTER TABLE `events`
  ADD CONSTRAINT `events_ibfk_1` FOREIGN KEY (`created_by_id`) REFERENCES `users` (`id`),
  ADD CONSTRAINT `events_ibfk_2` FOREIGN KEY (`featured_by`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `events_ibfk_3` FOREIGN KEY (`reviewed_by`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `events_ibfk_4` FOREIGN KEY (`archived_by`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `event_assets`
--
ALTER TABLE `event_assets`
  ADD CONSTRAINT `event_assets_ibfk_1` FOREIGN KEY (`event_id`) REFERENCES `events` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `event_category_links`
--
ALTER TABLE `event_category_links`
  ADD CONSTRAINT `event_category_links_ibfk_1` FOREIGN KEY (`event_id`) REFERENCES `events` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `event_category_links_ibfk_2` FOREIGN KEY (`category_id`) REFERENCES `event_categories` (`id`);

--
-- Constraints for table `event_likes`
--
ALTER TABLE `event_likes`
  ADD CONSTRAINT `event_likes_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `event_likes_ibfk_2` FOREIGN KEY (`event_id`) REFERENCES `events` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `event_registrations`
--
ALTER TABLE `event_registrations`
  ADD CONSTRAINT `event_registrations_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `event_registrations_ibfk_2` FOREIGN KEY (`event_id`) REFERENCES `events` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `registration_form_questions`
--
ALTER TABLE `registration_form_questions`
  ADD CONSTRAINT `registration_form_questions_ibfk_1` FOREIGN KEY (`event_id`) REFERENCES `events` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `registration_form_responses`
--
ALTER TABLE `registration_form_responses`
  ADD CONSTRAINT `registration_form_responses_ibfk_1` FOREIGN KEY (`registration_id`) REFERENCES `event_registrations` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `registration_form_responses_ibfk_2` FOREIGN KEY (`question_id`) REFERENCES `registration_form_questions` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `registration_form_responses_ibfk_3` FOREIGN KEY (`event_id`) REFERENCES `events` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `registration_form_responses_ibfk_4` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `user_interests`
--
ALTER TABLE `user_interests`
  ADD CONSTRAINT `user_interests_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `user_interests_ibfk_2` FOREIGN KEY (`category_id`) REFERENCES `event_categories` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
