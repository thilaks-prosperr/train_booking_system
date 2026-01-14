import React from 'react';
import '../styles/AboutPage.css';
import trainImage from '/images/vande_barath.jpg';

const AboutPage = () => {
  return (
    <div className="about-page-container">
      <div className="about-page-card">
        <h1 className="about-page-title">About RailBook</h1>
        
        <div className="about-page-overview">
          <img src={trainImage} alt="Vande Bharath Express" className="about-page-image"/>
          <div>
            <h2 className="overview-title">Overview</h2>
            <p className="about-page-text">
              The Karnataka Railway Booking System is a regional, high-concurrency web application designed to manage train reservations across major Karnataka hubs such as Bangalore, Mangalore, and Hubballi. The system focuses on complete route discovery, transparent seat availability, and efficient handling of high booking traffic.
            </p>
          </div>
        </div>

        <p className="about-page-text">
          Welcome to RailBook, your number one source for train ticket bookings. We're dedicated to giving you the very best of our services, with a focus on reliability, customer service, and uniqueness.
        </p>
        <p className="about-page-text">
          Founded in 2024, RailBook has come a long way from its beginnings. When we first started out, our passion for easy and efficient travel drove us to do intense research, and gave us the impetus to turn hard work and inspiration into to a booming online platform. We now serve customers all over the country, and are thrilled to be a part of the quirky, eco-friendly wing of the travel industry.
        </p>
        <p className="about-page-text">
          We hope you enjoy our services as much as we enjoy offering them to you. If you have any questions or comments, please don't hesitate to contact us.
        </p>
        <p className="about-page-sincerely">
          Sincerely,<br />
          The RailBook Team
        </p>
      </div>
    </div>
  );
};

export default AboutPage;
