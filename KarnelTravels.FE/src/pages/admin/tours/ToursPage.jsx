import { useState } from 'react';
import TourDashboard from './TourDashboard';
import TourEditor from './components/TourEditor';
import ItineraryBuilder from './components/ItineraryBuilder';
import DepartureManager from './components/DepartureManager';
import InclusionManager from './components/InclusionManager';

const ToursPage = () => {
  const [currentView, setCurrentView] = useState('list'); // list, editor, itinerary, departure, inclusion
  const [selectedTour, setSelectedTour] = useState(null);

  const handleEditTour = (tour) => {
    setSelectedTour(tour);
    setCurrentView('editor');
  };

  const handleViewDetails = (tour) => {
    setSelectedTour(tour);
    setCurrentView('itinerary');
  };

  const handleBackToList = () => {
    setCurrentView('list');
    setSelectedTour(null);
  };

  const handleSaved = (tour) => {
    if (tour) {
      setSelectedTour(tour);
    }
  };

  const handleOpenItinerary = (tour) => {
    setSelectedTour(tour);
    setCurrentView('itinerary');
  };

  const handleOpenDeparture = (tour) => {
    setSelectedTour(tour);
    setCurrentView('departure');
  };

  const handleOpenInclusion = (tour) => {
    setSelectedTour(tour);
    setCurrentView('inclusion');
  };

  // If editing a tour, show editor
  if (currentView === 'editor') {
    return (
      <TourEditor
        tour={selectedTour}
        onClose={handleBackToList}
        onSaved={handleSaved}
      />
    );
  }

  // If editing itinerary
  if (currentView === 'itinerary' && selectedTour) {
    return (
      <ItineraryBuilder
        tourId={selectedTour.tourId}
        tourName={selectedTour.name}
        onClose={handleBackToList}
        onSaved={() => {}}
      />
    );
  }

  // If editing departures
  if (currentView === 'departure' && selectedTour) {
    return (
      <DepartureManager
        tourId={selectedTour.tourId}
        tourName={selectedTour.name}
        onClose={handleBackToList}
      />
    );
  }

  // If editing inclusions
  if (currentView === 'inclusion' && selectedTour) {
    return (
      <InclusionManager
        tourId={selectedTour.tourId}
        tourName={selectedTour.name}
        onClose={handleBackToList}
      />
    );
  }

  // Default: show tour list
  return (
    <div className="space-y-6">
      <TourDashboard
        onEditTour={handleEditTour}
        onViewDetails={handleViewDetails}
        onOpenItinerary={handleOpenItinerary}
        onOpenDeparture={handleOpenDeparture}
        onOpenInclusion={handleOpenInclusion}
      />
    </div>
  );
};

export default ToursPage;
