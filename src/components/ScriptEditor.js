import React, { useState } from 'react';
import { VStack, HStack, Heading, Textarea, Button, Input, Tag, TagLabel, useToast, Box, Text } from '@chakra-ui/react';
import { useSelector, useDispatch } from 'react-redux';
import { scriptSlice } from '../store/scriptSlice';

function ScriptEditor() {
  const [currentScript, setCurrentScript] = useState('');
  const [sceneTag, setSceneTag] = useState('');
  const dispatch = useDispatch();
  const toast = useToast();
  const { versions, currentVersion, scenes } = useSelector((state) => state.script);

  const handleScriptChange = (event) => {
    setCurrentScript(event.target.value);
  };

  const handleSaveVersion = () => {
    dispatch(scriptSlice.actions.addVersion(currentScript));
    toast({
      title: 'Version saved',
      status: 'success',
      duration: 2000,
      isClosable: true,
    });
  };

  const handleRevertVersion = (version) => {
    dispatch(scriptSlice.actions.setCurrentVersion(version));
    setCurrentScript(version);
  };

  const handleAddSceneTag = () => {
    if (sceneTag) {
      dispatch(scriptSlice.actions.addScene({ tag: sceneTag, characters: [], shots: [] }));
      setSceneTag('');
    }
  };

  return (
    <VStack spacing={4} align="stretch" width="100%">
      <Heading as="h2" size="lg">Script Editor</Heading>
      <Textarea
        value={currentScript}
        onChange={handleScriptChange}
        placeholder="Start writing your script..."
        size="lg"
        height="300px"
      />
      <HStack>
        <Button colorScheme="blue" onClick={handleSaveVersion}>Save Version</Button>
        <Input
          placeholder="Add scene tag"
          value={sceneTag}
          onChange={(e) => setSceneTag(e.target.value)}
        />
        <Button onClick={handleAddSceneTag}>Add Tag</Button>
      </HStack>
      <Box>
        <Heading as="h3" size="md">Scenes:</Heading>
        {scenes.map((scene, index) => (
          <VStack key={index} align="stretch" spacing={2} p={2} borderWidth={1} borderRadius="md">
            <Tag m={1}>
              <TagLabel>{scene.tag}</TagLabel>
            </Tag>
            <Text fontSize="sm">Characters: {scene.characters.join(', ')}</Text>
            <Text fontSize="sm">Shots: {scene.shots.join(', ')}</Text>
          </VStack>
        ))}
      </Box>
      <Box>
        <Heading as="h3" size="md">Previous Versions:</Heading>
        {versions.map((version, index) => (
          <Button key={index} onClick={() => handleRevertVersion(version)} m={1}>
            Version {index + 1}
          </Button>
        ))}
      </Box>
    </VStack>
  );
}

export default ScriptEditor;
