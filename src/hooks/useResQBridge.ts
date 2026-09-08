import { useState, useEffect } from 'react';
import { store } from '../services/store';

export function useResQBridge() {
  const [state, setState] = useState(store.getState());

  useEffect(() => {
    const unsubscribe = store.subscribe((newState) => {
      setState({ ...newState });
    });
    return unsubscribe;
  }, []);

  return {
    state,
    currentUser: state.currentUser,
    emergencies: state.emergencies,
    rescueTeams: state.rescueTeams,
    shelters: state.shelters,
    urgentRequirements: state.urgentRequirements,
    activeEmergencyId: state.activeEmergencyId,
    communicationConfig: state.communicationConfig,
    communicationStats: store.getCommunicationStats(),
    actions: {
      setRole: store.setRole.bind(store),
      setActiveEmergency: store.setActiveEmergency.bind(store),
      setCommunicationMode: store.setCommunicationMode.bind(store),
      updateCommunicationConfig: store.updateCommunicationConfig.bind(store),
      getEffectiveCommunicationMethod: store.getEffectiveCommunicationMethod.bind(store),
      createEmergency: store.createEmergency.bind(store),
      confirmSmsSent: store.confirmSmsSent.bind(store),
      markSmsFailed: store.markSmsFailed.bind(store),
      syncPendingEmergency: store.syncPendingEmergency.bind(store),
      syncAllOfflineEmergencies: store.syncAllOfflineEmergencies.bind(store),
      assignRescueTeam: store.assignRescueTeam.bind(store),
      updateEmergencyStatus: store.updateEmergencyStatus.bind(store),
      selectShelter: store.selectShelter.bind(store),
      completeTransportAndResolve: store.completeTransportAndResolve.bind(store),
      addShelter: store.addShelter.bind(store),
      updateShelter: store.updateShelter.bind(store),
      deleteShelter: store.deleteShelter.bind(store),
      toggleShelterSafety: store.toggleShelterSafety.bind(store),
      setShelterVerification: store.setShelterVerification.bind(store),
      addUrgentRequirement: store.addUrgentRequirement.bind(store),
      updateRequirementStatus: store.updateRequirementStatus.bind(store),
      deleteRequirement: store.deleteRequirement.bind(store),
      resetToDemoData: store.resetToDemoData.bind(store),
    }
  };
}
