import React, { useEffect, useState } from 'react';
import { Modal, ModalOverlay, ModalContent, ModalHeader, ModalCloseButton, ModalBody, Spinner } from '@chakra-ui/react';

const SpinnerModal = ({ isOpen, onClose }) => {
  return (
    <Modal closeOnOverlayClick={false}  isOpen={isOpen} onClose={onClose} isCentered>
      <ModalOverlay />
      <ModalContent style={{ backgroundColor: "#2C2C2A" }}>
        <ModalHeader>Processing Swap...</ModalHeader>
        <ModalBody className="text-center">
          <Spinner size="xl" color="teal.500" />
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default SpinnerModal;
