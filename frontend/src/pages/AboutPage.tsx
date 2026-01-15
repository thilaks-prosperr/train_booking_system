import React from 'react';
import trainImage from '/images/vande_barath.jpg';

const AboutPage = () => {
  return (
    <div className="container max-w-4xl mx-auto py-12 px-4 bg-background">
      <div className="bg-card text-card-foreground rounded-xl shadow-sm border border-border p-8">
        <h1 className="text-4xl font-bold text-center mb-8 gradient-text">About RailBook</h1>

        <div className="flex flex-col md:flex-row gap-8 items-start mb-8">
          <img
            src={trainImage}
            alt="Vande Bharath Express"
            className="w-full md:w-[300px] h-auto rounded-lg shadow-md object-cover"
          />
          <div>
            <h2 className="text-2xl font-semibold mb-4 border-b-2 border-primary pb-2">Overview</h2>
            <p className="text-muted-foreground leading-relaxed mb-6">
              The Karnataka Railway Booking System is a regional, high-concurrency web application designed to manage train reservations across major Karnataka hubs such as Bangalore, Mangalore, and Hubballi. The system focuses on complete route discovery, transparent seat availability, and efficient handling of high booking traffic.
            </p>
          </div>
        </div>

        <p className="text-muted-foreground leading-relaxed mb-6">
          Welcome to RailBook, your number one source for train ticket bookings. We're dedicated to giving you the very best of our services, with a focus on reliability, customer service, and uniqueness.
        </p>
        <p className="text-muted-foreground leading-relaxed mb-6">
          Founded in 2024, RailBook has come a long way from its beginnings. When we first started out, our passion for easy and efficient travel drove us to do intense research, and gave us the impetus to turn hard work and inspiration into to a booming online platform. We now serve customers all over the country, and are thrilled to be a part of the quirky, eco-friendly wing of the travel industry.
        </p>
        <p className="text-muted-foreground leading-relaxed mb-6">
          We hope you enjoy our services as much as we enjoy offering them to you. If you have any questions or comments, please don't hesitate to contact us.
        </p>
        <p className="text-lg font-medium text-right mt-8 text-foreground">
          Sincerely,<br />
          The RailBook Team
        </p>
      </div>
    </div>
  );
};

export default AboutPage;
