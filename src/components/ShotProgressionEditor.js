import React, { useState, useEffect } from 'react';
import { VStack, HStack, Heading, Textarea, Button, Input, Select, Progress, Text, Image, useToast, Box, IconButton } from '@chakra-ui/react';
import { useSelector, useDispatch } from 'react-redux';
import { ArrowUpIcon, ArrowDownIcon } from '@chakra-ui/icons';
import axios from 'axios';
import { addShot, updateShot, moveShot, removeShot, selectShots } from '../store/shotSlice';

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
  const [videoPreviewUrl, setVideoPreviewUrl] = useState(null);
  const dispatch = useDispatch();
  const shots = useSelector(selectShots);
  const scenes = useSelector((state) => state.script.scenes);
  const characters = useSelector((state) => state.script.characters);
  const toast = useToast();

  useEffect(() => {
    return () => {
      if (videoPreviewUrl) {
        URL.revokeObjectURL(videoPreviewUrl);
      }
    };
  }, [videoPreviewUrl]);

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
      const previewUrl = URL.createObjectURL(file);
      setVideoPreviewUrl(previewUrl);
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

  const handleSaveShot = async (generateImage = false) => {
    let updatedShot = { ...shot };

    if (generateImage) {
      toast({
        title: 'Generating image...',
        status: 'info',
        duration: null,
        isClosable: false,
      });

      const generatedImageUrl = await generateImage();
      if (generatedImageUrl) {
        updatedShot.generatedImageUrl = generatedImageUrl;
      }
    }

    if (shots.find(s => s.id === shot.id)) {
      dispatch(updateShot(updatedShot));
    } else {
      dispatch(addShot(updatedShot));
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
    setVideoPreviewUrl(null);

    toast({
      title: generateImage ? 'Shot saved with generated image' : 'Shot saved',
      status: 'success',
      duration: 2000,
      isClosable: true,
    });
  };

  const handleMoveShot = (index, direction) => {
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex >= 0 && newIndex < shots.length) {
      dispatch(moveShot({ fromIndex: index, toIndex: newIndex }));
    }
  };

  return (
    <VStack spacing={4} align="stretch">
      <Heading as="h2" size="lg">Shot Progression Editor</Heading>
      <Progress value={(shots.length / 10) * 100} />
      <HStack>
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
      {videoPreviewUrl && (
        <Box>
          <video width="100%" controls>
            <source src={videoPreviewUrl} type={shot.video.type} />
            Your browser does not support the video tag.
          </video>
        </Box>
      )}
      <HStack>
        <Button colorScheme="blue" onClick={() => handleSaveShot(false)}>
          Save Shot
        </Button>
        <Button colorScheme="green" onClick={() => handleSaveShot(true)}>
          Save Shot and Generate Image
        </Button>
      </HStack>
      <VStack align="stretch">
        {shots.map((s, index) => (
          <HStack key={s.id} justify="space-between">
            <Text>{index + 1}: {s.name}</Text>
            <Text>Scene: {scenes.find(scene => scene.id === s.sceneId)?.name}</Text>
            <Text>Characters: {s.characterIds.map(id => characters.find(char => char.id === id)?.name).join(', ')}</Text>
            <Button size="sm" onClick={() => setShot(s)}>Edit</Button>
            <IconButton
              icon={<ArrowUpIcon />}
              onClick={() => handleMoveShot(index, 'up')}
              isDisabled={index === 0}
            />
            <IconButton
              icon={<ArrowDownIcon />}
              onClick={() => handleMoveShot(index, 'down')}
              isDisabled={index === shots.length - 1}
            />
            {s.generatedImageUrl && (
              <Image src={s.generatedImageUrl} alt={`Generated image for ${s.name}`} maxWidth="200px" />
            )}
          </HStack>
        ))}
      </VStack>
    </VStack>
  );
}

export default ShotProgressionEditor;
