import React, { useState } from 'react';
import { VStack, Heading, Input, Textarea, Button, Image, HStack, Tag, Box } from '@chakra-ui/react';

function CharacterEditor() {
  const [character, setCharacter] = useState({
    name: '',
    description: '',
    image: null,
  });

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setCharacter((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      setCharacter((prev) => ({ ...prev, image: file }));
    }
  };

  const handleSaveCharacter = () => {
    // This is a stub. In a real application, this would save the character to state or backend.
    console.log('Saving character:', character);
  };

  return (
    <VStack spacing={4} align="stretch">
      <Heading as="h2" size="lg">Character Editor</Heading>
      <Input
        name="name"
        value={character.name}
        onChange={handleInputChange}
        placeholder="Character Name"
      />
      <Textarea
        name="description"
        value={character.description}
        onChange={handleInputChange}
        placeholder="Character Description"
      />
      <Input
        type="file"
        accept="image/*"
        onChange={handleImageUpload}
      />
      {character.image && (
        <Image
          src={URL.createObjectURL(character.image)}
          alt="Character"
          maxWidth="200px"
        />
      )}
      <Button colorScheme="blue" onClick={handleSaveCharacter}>
        Save Character
      </Button>
    </VStack>
  );
}

export default CharacterEditor;
