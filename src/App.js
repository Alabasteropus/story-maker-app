import React, { useState } from 'react';
import { ChakraProvider, Box, VStack, HStack, Heading, Textarea, Button, Input, Tag, TagLabel, useToast, Image, Progress, Text, Select, Grid, GridItem, extendTheme, Container } from '@chakra-ui/react';
import { Provider, useSelector, useDispatch } from 'react-redux';
import { configureStore, createSlice } from '@reduxjs/toolkit';
import axios from 'axios';

const theme = extendTheme({
  config: {
    initialColorMode: 'dark',
    useSystemColorMode: false,
  },
});

// Redux slice
const scriptSlice = createSlice({
  name: 'script',
  initialState: {
    versions: [],
    currentVersion: '',
    scenes: [],
    characters: [],
    shots: [],
    snapshots: [],
    currentSnapshotIndex: -1,
  },
  reducers: {
    addVersion: (state, action) => {
      state.versions.push(action.payload);
      state.currentVersion = action.payload;
    },
    setCurrentVersion: (state, action) => {
      state.currentVersion = action.payload;
    },
    addScene: (state, action) => {
      state.scenes.push(action.payload);
    },
    addCharacter: (state, action) => {
      state.characters.push(action.payload);
    },
    updateCharacter: (state, action) => {
      const index = state.characters.findIndex(char => char.id === action.payload.id);
      if (index !== -1) {
        state.characters[index] = action.payload;
      }
    },
    addShot: (state, action) => {
      state.shots.push(action.payload);
    },
    updateShot: (state, action) => {
      const index = state.shots.findIndex(shot => shot.id === action.payload.id);
      if (index !== -1) {
        state.shots[index] = action.payload;
      }
    },
    updateShotWithImage: (state, action) => {
      const { id, imageUrl } = action.payload;
      const index = state.shots.findIndex(shot => shot.id === id);
      if (index !== -1) {
        state.shots[index] = { ...state.shots[index], generatedImage: imageUrl };
      }
    },
    deleteShot: (state, action) => {
      state.shots = state.shots.filter(shot => shot.id !== action.payload);
    },
    takeSnapshot: (state) => {
      state.snapshots.push({
        versions: [...state.versions],
        currentVersion: state.currentVersion,
        scenes: [...state.scenes],
        characters: [...state.characters],
        shots: [...state.shots],
      });
      state.currentSnapshotIndex = state.snapshots.length - 1;
    },
    navigateSnapshot: (state, action) => {
      const index = action.payload;
      if (index >= 0 && index < state.snapshots.length) {
        const snapshot = state.snapshots[index];
        state.versions = [...snapshot.versions];
        state.currentVersion = snapshot.currentVersion;
        state.scenes = [...snapshot.scenes];
        state.characters = [...snapshot.characters];
        state.shots = [...snapshot.shots];
        state.currentSnapshotIndex = index;
      }
    },
  },
});

const store = configureStore({
  reducer: {
    script: scriptSlice.reducer,
  },
});

function ScriptEditor() {
  const [currentScript, setCurrentScript] = useState('');
  const [sceneTag, setSceneTag] = useState('');
  const [comparisonVersion, setComparisonVersion] = useState(null);
  const dispatch = useDispatch();
  const toast = useToast();
  const { versions, currentVersion, scenes, snapshots, currentSnapshotIndex, characters, shots } = useSelector((state) => state.script);

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

  const handleTakeSnapshot = () => {
    dispatch(scriptSlice.actions.takeSnapshot(currentScript));
    toast({
      title: 'Snapshot taken',
      status: 'success',
      duration: 2000,
      isClosable: true,
    });
  };

  const handleNavigateHistory = (direction) => {
    dispatch(scriptSlice.actions.navigateHistory(direction));
  };

  const handleCompareVersions = (version) => {
    setComparisonVersion(version);
  };

  // Placeholder for GPT-4 interaction
  const handleGPT4Interaction = () => {
    // This would be replaced with actual API call to GPT-4
    toast({
      title: 'GPT-4 Interaction',
      description: 'This feature is not yet implemented.',
      status: 'info',
      duration: 2000,
      isClosable: true,
    });
  };

  return (
    <VStack spacing={4} align="stretch">
      <Heading as="h1" size="xl">Story Maker App</Heading>
      <HStack>
        <Textarea
          value={currentScript}
          onChange={handleScriptChange}
          placeholder="Start writing your script..."
          size="lg"
          height="300px"
          flex="1"
        />
        {comparisonVersion && (
          <Textarea
            value={comparisonVersion}
            isReadOnly
            placeholder="Comparison version"
            size="lg"
            height="300px"
            flex="1"
          />
        )}
      </HStack>
      <HStack>
        <Button colorScheme="blue" onClick={handleSaveVersion}>Save Version</Button>
        <Button colorScheme="green" onClick={handleTakeSnapshot}>Take Snapshot</Button>
        <Button colorScheme="purple" onClick={handleGPT4Interaction}>Ask GPT-4 for Ideas</Button>
      </HStack>
      <HStack>
        <Button onClick={() => handleNavigateHistory('back')} isDisabled={currentSnapshotIndex === 0}>Previous</Button>
        <Button onClick={() => handleNavigateHistory('forward')} isDisabled={currentSnapshotIndex === snapshots.length - 1}>Next</Button>
      </HStack>
      <HStack>
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
          <HStack key={index}>
            <Button onClick={() => handleRevertVersion(version)} m={1}>
              Version {index + 1}
            </Button>
            <Button onClick={() => handleCompareVersions(version)} m={1}>
              Compare
            </Button>
          </HStack>
        ))}
      </Box>
    </VStack>
  );
}

function CharacterEditor() {
  const [character, setCharacter] = useState({
    id: Date.now(),
    name: '',
    description: '',
    behaviors: '',
    motivations: '',
    image: null,
    referenceImages: [],
    associatedScenes: [],
  });
  const dispatch = useDispatch();
  const toast = useToast();
  const scenes = useSelector((state) => state.script.scenes);

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

  const handleReferenceImageUpload = (event) => {
    const files = Array.from(event.target.files);
    setCharacter((prev) => ({
      ...prev,
      referenceImages: [...prev.referenceImages, ...files],
    }));
  };

  const handleSceneAssociation = (sceneId) => {
    setCharacter((prev) => ({
      ...prev,
      associatedScenes: prev.associatedScenes.includes(sceneId)
        ? prev.associatedScenes.filter(id => id !== sceneId)
        : [...prev.associatedScenes, sceneId],
    }));
  };

  const handleSaveCharacter = () => {
    dispatch(scriptSlice.actions.addCharacter(character));
    toast({
      title: 'Character saved',
      status: 'success',
      duration: 2000,
      isClosable: true,
    });
    setCharacter({
      id: Date.now(),
      name: '',
      description: '',
      behaviors: '',
      motivations: '',
      image: null,
      referenceImages: [],
      associatedScenes: [],
    });
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
      <Textarea
        name="behaviors"
        value={character.behaviors}
        onChange={handleInputChange}
        placeholder="Character Behaviors"
      />
      <Textarea
        name="motivations"
        value={character.motivations}
        onChange={handleInputChange}
        placeholder="Character Motivations"
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
      <Input
        type="file"
        accept="image/*"
        multiple
        onChange={handleReferenceImageUpload}
      />
      <HStack>
        {character.referenceImages.map((img, index) => (
          <Image
            key={index}
            src={URL.createObjectURL(img)}
            alt={`Reference ${index + 1}`}
            maxWidth="100px"
          />
        ))}
      </HStack>
      <Box>
        <Heading as="h4" size="md">Associated Scenes:</Heading>
        {scenes.map((scene) => (
          <Tag
            key={scene.id}
            m={1}
            cursor="pointer"
            colorScheme={character.associatedScenes.includes(scene.id) ? "green" : "gray"}
            onClick={() => handleSceneAssociation(scene.id)}
          >
            {scene}
          </Tag>
        ))}
      </Box>
      <Button colorScheme="blue" onClick={handleSaveCharacter}>
        Save Character
      </Button>
    </VStack>
  );
}

function ShotProgressionEditor() {
  const [shot, setShot] = useState({
    id: Date.now(),
    number: '',
    name: '',
    description: '',
    image: null,
    video: null,
    generatedImageUrl: null,
    sceneId: '',
    characterIds: [],
  });
  const dispatch = useDispatch();
  const shots = useSelector((state) => state.script.shots);
  const scenes = useSelector((state) => state.script.scenes);
  const characters = useSelector((state) => state.script.characters);
  const toast = useToast();

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setShot((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      setShot((prev) => ({ ...prev, image: file }));
    }
  };

  const handleVideoUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      setShot((prev) => ({ ...prev, video: file }));
    }
  };

  const handleSceneChange = (event) => {
    setShot((prev) => ({ ...prev, sceneId: event.target.value }));
  };

  const handleCharacterChange = (event) => {
    const selectedCharacterIds = Array.from(event.target.selectedOptions, option => option.value);
    setShot((prev) => ({ ...prev, characterIds: selectedCharacterIds }));
  };

  const generateImage = async () => {
    try {
      if (!shot.description) {
        throw new Error('Shot description is required for image generation');
      }

      const response = await axios.post(
        'https://api.stability.ai/v1/generation/stable-diffusion-xl-1024-v1-0/text-to-image',
        {
          text_prompts: [{ text: shot.description }],
          cfg_scale: 7,
          height: 1024,
          width: 1024,
          steps: 30,
          samples: 1,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
            Authorization: `Bearer ${process.env.REACT_APP_STABILITY_API_KEY}`,
          },
        }
      );

      if (!response.data.artifacts || response.data.artifacts.length === 0) {
        throw new Error('No image generated from the API');
      }

      const generatedImageUrl = `data:image/png;base64,${response.data.artifacts[0].base64}`;
      return generatedImageUrl;
    } catch (error) {
      console.error('Error generating image:', error);
      let errorMessage = 'An unexpected error occurred while generating the image.';
      if (error.response) {
        errorMessage = `API Error: ${error.response.data.message || error.response.statusText}`;
      } else if (error.request) {
        errorMessage = 'Network error: Unable to reach the image generation service.';
      } else if (error.message) {
        errorMessage = error.message;
      }
      toast({
        title: 'Error generating image',
        description: errorMessage,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      return null;
    }
  };

  const handleSaveShot = async () => {
    toast({
      title: 'Generating image...',
      status: 'info',
      duration: null,
      isClosable: false,
    });

    const generatedImageUrl = await generateImage();

    if (generatedImageUrl) {
      const updatedShot = { ...shot, generatedImageUrl };

      if (shots.find(s => s.id === shot.id)) {
        dispatch(scriptSlice.actions.updateShot(updatedShot));
      } else {
        dispatch(scriptSlice.actions.addShot(updatedShot));
      }

      setShot({
        id: Date.now(),
        number: '',
        name: '',
        description: '',
        image: null,
        video: null,
        generatedImageUrl: null,
        sceneId: '',
        characterIds: [],
      });

      toast({
        title: 'Shot saved with generated image',
        status: 'success',
        duration: 2000,
        isClosable: true,
      });
    } else {
      toast({
        title: 'Shot saved without image',
        description: 'Image generation failed. Please try again later.',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  return (
    <VStack spacing={4} align="stretch">
      <Heading as="h2" size="lg">Shot Progression Editor</Heading>
      <Progress value={(shots.length / 10) * 100} />
      <HStack>
        <Input
          name="number"
          value={shot.number}
          onChange={handleInputChange}
          placeholder="Shot Number"
        />
        <Input
          name="name"
          value={shot.name}
          onChange={handleInputChange}
          placeholder="Shot Name"
        />
      </HStack>
      <Select placeholder="Select scene" onChange={handleSceneChange} value={shot.sceneId}>
        {scenes.map((scene) => (
          <option key={scene.id} value={scene.id}>{scene.name}</option>
        ))}
      </Select>
      <Select multiple onChange={handleCharacterChange} value={shot.characterIds}>
        {characters.map((character) => (
          <option key={character.id} value={character.id}>{character.name}</option>
        ))}
      </Select>
      <Textarea
        name="description"
        value={shot.description}
        onChange={handleInputChange}
        placeholder="Shot Description"
      />
      <Input
        type="file"
        accept="image/*"
        onChange={handleImageUpload}
      />
      <Input
        type="file"
        accept="video/*"
        onChange={handleVideoUpload}
      />
      <Button colorScheme="blue" onClick={handleSaveShot}>
        Save Shot and Generate Image
      </Button>
      <VStack align="stretch">
        {shots.map((s) => (
          <HStack key={s.id} justify="space-between">
            <Text>{s.number}: {s.name}</Text>
            <Text>Scene: {scenes.find(scene => scene.id === s.sceneId)?.name}</Text>
            <Text>Characters: {s.characterIds.map(id => characters.find(char => char.id === id)?.name).join(', ')}</Text>
            <Button size="sm" onClick={() => setShot(s)}>Edit</Button>
            {s.generatedImageUrl && (
              <Image src={s.generatedImageUrl} alt={`Generated image for ${s.name}`} maxWidth="200px" />
            )}
          </HStack>
        ))}
      </VStack>
    </VStack>
  );
}

function App() {
  return (
    <Provider store={store}>
      <ChakraProvider theme={theme}>
        <Box className="App" bg="gray.900" minHeight="100vh" color="white">
          <Container maxW="container.xl" py={8}>
            <Heading as="h1" size="2xl" mb={8} textAlign="center">Story Maker App</Heading>
            <Grid templateColumns={["1fr", "1fr", "1fr 2fr 1fr"]} gap={8}>
              <GridItem>
                <Box bg="gray.800" p={4} borderRadius="md" boxShadow="md">
                  <ScriptEditor />
                </Box>
              </GridItem>
              <GridItem>
                <Box bg="gray.800" p={4} borderRadius="md" boxShadow="md">
                  <ShotProgressionEditor />
                </Box>
              </GridItem>
              <GridItem>
                <Box bg="gray.800" p={4} borderRadius="md" boxShadow="md">
                  <CharacterEditor />
                </Box>
              </GridItem>
            </Grid>
          </Container>
        </Box>
      </ChakraProvider>
    </Provider>
  );
}

export default App;
