import { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw } from 'lucide-react';

// Type definitions
interface HillClimbingState {
  current: number;
  best: number;
  iteration: number;
  history: Array<{
    iteration: number;
    current: number;
    value: number;
  }>;
  stepSize: number;
}

interface City {
  x: number;
  y: number;
}

interface ACOState {
  pheromones: number[][];
  bestPath: number[];
  bestDistance: number;
  iteration: number;
  cities: City[];
}

interface IFState {
  voltage: number;
  time: number;
  spikes: number[];
  input: number;
  history: Array<{
    time: number;
    voltage: number;
    input: number;
  }>;
}

interface GAState {
  population: number[];
  generation: number;
  bestFitness: number;
  avgFitness: number;
  history: Array<{
    gen: number;
    best: number;
    avg: number;
  }>;
}

interface SAState {
  current: number;
  best: number;
  temperature: number;
  iteration: number;
  history: Array<{
    iteration: number;
    current: number;
    temperature: number;
    value: number;
  }>;
}

const NatureInspiredComputingModels = () => {
  const [activeModel, setActiveModel] = useState('hillclimbing');
  const [isRunning, setIsRunning] = useState(false);

  // Hill Climbing State
  const [hcState, setHcState] = useState<HillClimbingState>({
    current: 0,
    best: 0,
    iteration: 0,
    history: [],
    stepSize: 0.1
  });

  // Ant Colony State
  const [acoState, setAcoState] = useState<ACOState>({
    pheromones: Array(4).fill(0).map(() => Array(4).fill(0.1)),
    bestPath: [],
    bestDistance: Infinity,
    iteration: 0,
    cities: [{x: 50, y: 50}, {x: 200, y: 100}, {x: 150, y: 200}, {x: 80, y: 180}]
  });

  // Integrate & Fire Neuron State
  const [ifState, setIfState] = useState<IFState>({
    voltage: -70,
    time: 0,
    spikes: [],
    input: 0,
    history: []
  });

  // Genetic Algorithm State
  const [gaState, setGaState] = useState<GAState>({
    population: [],
    generation: 0,
    bestFitness: 0,
    avgFitness: 0,
    history: []
  });

  // Simulated Annealing State
  const [saState, setSaState] = useState<SAState>({
    current: 0,
    best: 0,
    temperature: 100,
    iteration: 0,
    history: []
  });

  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize populations
  useEffect(() => {
    initializeGA();
  }, []);

  const initializeGA = () => {
    const population = Array(10).fill(0).map(() => Math.floor(Math.random() * 32));
    const fitness = population.map(x => x * x);
    const avgFit = fitness.reduce((a, b) => a + b) / fitness.length;
    const bestFit = Math.max(...fitness);
    
    setGaState({
      population,
      generation: 0,
      bestFitness: bestFit,
      avgFitness: avgFit,
      history: [{gen: 0, best: bestFit, avg: avgFit}]
    });
  };

  const startSimulation = () => {
    setIsRunning(true);
    const speeds: Record<string, number> = {
      'hillclimbing': 800,  // Slower for understanding
      'aco': 1200,          // Very slow to see ant behavior
      'neuron': 200,        // Slower for neuron dynamics to be visible
      'genetic': 1500,      // Slow to see evolution
      'annealing': 600      // Medium speed
    };
    
    intervalRef.current = setInterval(() => {
      switch(activeModel) {
        case 'hillclimbing':
          stepHillClimbing();
          break;
        case 'aco':
          stepACO();
          break;
        case 'neuron':
          stepNeuron();
          break;
        case 'genetic':
          stepGA();
          break;
        case 'annealing':
          stepSA();
          break;
      }
    }, speeds[activeModel] || 500);
  };

  const stopSimulation = () => {
    setIsRunning(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
  };

  const resetSimulation = () => {
    stopSimulation();
    switch(activeModel) {
      case 'hillclimbing':
        setHcState({current: 0, best: 0, iteration: 0, history: [], stepSize: 0.1});
        break;
      case 'aco':
        setAcoState({
          pheromones: Array(4).fill(0).map(() => Array(4).fill(0.1)),
          bestPath: [],
          bestDistance: Infinity,
          iteration: 0,
          cities: [{x: 50, y: 50}, {x: 200, y: 100}, {x: 150, y: 200}, {x: 80, y: 180}]
        });
        break;
      case 'neuron':
        setIfState({voltage: -70, time: 0, spikes: [], input: 0, history: []});
        break;
      case 'genetic':
        initializeGA();
        break;
      case 'annealing':
        setSaState({current: 0, best: 0, temperature: 100, iteration: 0, history: []});
        break;
    }
  };

  // Hill Climbing Implementation
  const stepHillClimbing = () => {
    setHcState(prev => {
      const objective = (x: number) => -(x - 2) * (x - 2) + 4; // Peak at x=2
      
      const neighbors = [
        prev.current - prev.stepSize,
        prev.current + prev.stepSize
      ];
      
      const currentValue = objective(prev.current);
      const neighborValues = neighbors.map(n => ({x: n, value: objective(n)}));
      const bestNeighbor = neighborValues.reduce((a, b) => a.value > b.value ? a : b);
      
      let newCurrent = prev.current;
      let newBest = prev.best;
      
      if (bestNeighbor.value > currentValue) {
        newCurrent = bestNeighbor.x;
        if (bestNeighbor.value > objective(prev.best)) {
          newBest = bestNeighbor.x;
        }
      }
      
      const newHistory = [...prev.history.slice(-50), {
        iteration: prev.iteration,
        current: newCurrent,
        value: objective(newCurrent)
      }];
      
      return {
        ...prev,
        current: newCurrent,
        best: newBest,
        iteration: prev.iteration + 1,
        history: newHistory
      };
    });
  };

  // Ant Colony Implementation
  const stepACO = () => {
    setAcoState(prev => {
      const numAnts = 3;
      const evaporationRate = 0.1;
      const pheromoneDeposit = 100;
      
      // Distance calculation
      const distance = (city1: City, city2: City) => 
        Math.sqrt((city1.x - city2.x) ** 2 + (city1.y - city2.y) ** 2);
      
      let newPheromones = prev.pheromones.map(row => 
        row.map(val => val * (1 - evaporationRate))
      );
      
      let bestPath = prev.bestPath;
      let bestDistance = prev.bestDistance;
      
      // Simulate ants
      for (let ant = 0; ant < numAnts; ant++) {
        const path = [0];
        const unvisited = [1, 2, 3];
        let currentCity = 0;
        let pathDistance = 0;
        
        while (unvisited.length > 0) {
          const probabilities = unvisited.map(city => {
            const pheromone = prev.pheromones[currentCity][city];
            const dist = distance(prev.cities[currentCity], prev.cities[city]);
            return Math.pow(pheromone, 1) * Math.pow(1/dist, 2);
          });
          
          const total = probabilities.reduce((a, b) => a + b, 0);
          const normalizedProbs = probabilities.map(p => p / total);
          
          // Roulette wheel selection
          const rand = Math.random();
          let cumSum = 0;
          let selectedIndex = 0;
          for (let i = 0; i < normalizedProbs.length; i++) {
            cumSum += normalizedProbs[i];
            if (rand <= cumSum) {
              selectedIndex = i;
              break;
            }
          }
          
          const nextCity = unvisited[selectedIndex];
          pathDistance += distance(prev.cities[currentCity], prev.cities[nextCity]);
          path.push(nextCity);
          unvisited.splice(selectedIndex, 1);
          currentCity = nextCity;
        }
        
        // Return to start
        pathDistance += distance(prev.cities[currentCity], prev.cities[0]);
        
        if (pathDistance < bestDistance) {
          bestDistance = pathDistance;
          bestPath = [...path];
        }
        
        // Update pheromones
        for (let i = 0; i < path.length; i++) {
          const from = path[i];
          const to = path[(i + 1) % path.length];
          newPheromones[from][to] += pheromoneDeposit / pathDistance;
          newPheromones[to][from] += pheromoneDeposit / pathDistance;
        }
      }
      
      return {
        ...prev,
        pheromones: newPheromones,
        bestPath,
        bestDistance,
        iteration: prev.iteration + 1
      };
    });
  };

  // Integrate & Fire Neuron Implementation
  const stepNeuron = () => {
    setIfState(prev => {
      const dt = 1; // time step
      const tau = 10; // membrane time constant
      const threshold = -55;
      const reset = -70;
      const input = prev.input;
      
      let newVoltage = prev.voltage + dt * (input - prev.voltage) / tau;
      let newSpikes = [...prev.spikes];
      
      if (newVoltage >= threshold) {
        newSpikes.push(prev.time);
        newVoltage = reset;
      }
      
      const newHistory = [...prev.history.slice(-100), {
        time: prev.time,
        voltage: newVoltage,
        input: input
      }];
      
      return {
        ...prev,
        voltage: newVoltage,
        time: prev.time + dt,
        spikes: newSpikes.slice(-10),
        history: newHistory
      };
    });
  };

  // Genetic Algorithm Implementation
  const stepGA = () => {
    setGaState(prev => {
      const fitness = prev.population.map(x => x * x);
      const totalFitness = fitness.reduce((a, b) => a + b);
      
      // Selection (roulette wheel)
      const select = (): number => {
        const rand = Math.random() * totalFitness;
        let sum = 0;
        for (let i = 0; i < fitness.length; i++) {
          sum += fitness[i];
          if (rand <= sum) return prev.population[i];
        }
        return prev.population[prev.population.length - 1];
      };
      
      const newPopulation: number[] = [];
      
      // Create new generation
      for (let i = 0; i < prev.population.length; i += 2) {
        let parent1 = select();
        let parent2 = select();
        
        // Crossover (single point)
        const crossoverPoint = Math.floor(Math.random() * 5);
        const mask = (1 << crossoverPoint) - 1;
        let child1 = (parent1 & ~mask) | (parent2 & mask);
        let child2 = (parent2 & ~mask) | (parent1 & mask);
        
        // Mutation
        if (Math.random() < 0.1) {
          const bit = Math.floor(Math.random() * 5);
          child1 ^= (1 << bit);
        }
        if (Math.random() < 0.1) {
          const bit = Math.floor(Math.random() * 5);
          child2 ^= (1 << bit);
        }
        
        child1 = Math.min(child1, 31);
        child2 = Math.min(child2, 31);
        
        newPopulation.push(child1, child2);
      }
      
      const newFitness = newPopulation.map(x => x * x);
      const avgFit = newFitness.reduce((a, b) => a + b) / newFitness.length;
      const bestFit = Math.max(...newFitness);
      
      const newHistory = [...prev.history.slice(-50), {
        gen: prev.generation + 1,
        best: bestFit,
        avg: avgFit
      }];
      
      return {
        population: newPopulation.slice(0, 10),
        generation: prev.generation + 1,
        bestFitness: bestFit,
        avgFitness: avgFit,
        history: newHistory
      };
    });
  };

  // Simulated Annealing Implementation
  const stepSA = () => {
    setSaState(prev => {
      const objective = (x: number) => -(x - 2) * (x - 2) + 4;
      const coolingRate = 0.95;
      
      const neighbor = prev.current + (Math.random() - 0.5) * 0.5;
      const currentEnergy = -objective(prev.current);
      const neighborEnergy = -objective(neighbor);
      const deltaE = neighborEnergy - currentEnergy;
      
      let newCurrent = prev.current;
      let newBest = prev.best;
      
      if (deltaE < 0 || Math.random() < Math.exp(-deltaE / prev.temperature)) {
        newCurrent = neighbor;
        if (objective(neighbor) > objective(prev.best)) {
          newBest = neighbor;
        }
      }
      
      const newTemperature = prev.temperature * coolingRate;
      
      const newHistory = [...prev.history.slice(-50), {
        iteration: prev.iteration,
        current: newCurrent,
        temperature: newTemperature,
        value: objective(newCurrent)
      }];
      
      return {
        current: newCurrent,
        best: newBest,
        temperature: newTemperature,
        iteration: prev.iteration + 1,
        history: newHistory
      };
    });
  };

  const renderHillClimbing = () => (
    <div className="space-y-4">
      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="font-bold mb-2">Hill Climbing Optimization</h3>
        <p className="text-sm mb-4">Maximizing f(x) = -(x-2)² + 4</p>
        
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium">Current Position</label>
            <div className="text-lg font-mono bg-blue-100 p-2 rounded">{hcState.current.toFixed(3)}</div>
          </div>
          <div>
            <label className="block text-sm font-medium">Current Value</label>
            <div className="text-lg font-mono bg-green-100 p-2 rounded">{(-(hcState.current - 2) * (hcState.current - 2) + 4).toFixed(3)}</div>
          </div>
          <div>
            <label className="block text-sm font-medium">Step Count</label>
            <div className="text-lg font-mono bg-yellow-100 p-2 rounded">{hcState.iteration}</div>
          </div>
        </div>
        
        {hcState.iteration > 0 && (
          <div className="bg-blue-50 p-3 rounded mb-4">
            <h4 className="font-medium text-sm mb-1">Last Step Analysis:</h4>
            <div className="text-sm">
              <div>• Explored neighbors at positions ±{hcState.stepSize}</div>
              <div>• {hcState.history.length > 1 && hcState.history[hcState.history.length-1].value > hcState.history[hcState.history.length-2].value 
                ? '✅ Found better solution - moved uphill' 
                : '❌ No improvement found - may be at local optimum'}</div>
            </div>
          </div>
        )}
        
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">Step Size</label>
          <input 
            type="range" 
            min="0.01" 
            max="0.5" 
            step="0.01"
            value={hcState.stepSize}
            onChange={(e) => setHcState(prev => ({...prev, stepSize: parseFloat(e.target.value)}))}
            className="w-full"
          />
          <div className="text-sm text-gray-600">{hcState.stepSize}</div>
        </div>
      </div>
      
      {hcState.history.length > 0 && (
        <div className="bg-white border rounded-lg p-4">
          <h4 className="font-medium mb-2">Progress Chart</h4>
          <div className="h-32 border rounded flex items-end justify-between p-2 bg-gray-50">
            {hcState.history.slice(-20).map((point, i) => (
              <div 
                key={i} 
                className="bg-blue-500 w-2 rounded-t"
                style={{height: `${(point.value / 4) * 100}%`}}
                title={`Iteration ${point.iteration}: ${point.value.toFixed(3)}`}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );

  const renderACO = () => (
    <div className="space-y-4">
      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="font-bold mb-2">Ant Colony Optimization</h3>
        <p className="text-sm mb-4">Traveling Salesman Problem</p>
        
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium">Iteration</label>
            <div className="text-lg font-mono bg-blue-100 p-2 rounded">{acoState.iteration}</div>
          </div>
          <div>
            <label className="block text-sm font-medium">Best Distance</label>
            <div className="text-lg font-mono bg-green-100 p-2 rounded">{acoState.bestDistance === Infinity ? 'Searching...' : acoState.bestDistance.toFixed(1)}</div>
          </div>
        </div>
        
        {acoState.iteration > 0 && (
          <div className="bg-orange-50 p-3 rounded mb-4">
            <h4 className="font-medium text-sm mb-1">Ant Colony Behavior:</h4>
            <div className="text-sm">
              <div>• 3 artificial ants explore different paths</div>
              <div>• Pheromones evaporate (10% per iteration)</div>
              <div>• Shorter paths receive stronger pheromone reinforcement</div>
              <div>• Best path: {acoState.bestPath.length > 0 ? acoState.bestPath.map(i => String.fromCharCode(65 + i)).join('→') : 'Still exploring...'}</div>
            </div>
          </div>
        )}
      </div>
      
      <div className="bg-white border rounded-lg p-4">
        <h4 className="font-medium mb-2">Cities and Best Path</h4>
        <svg width="250" height="250" className="border rounded">
          {/* Draw cities */}
          {acoState.cities.map((city, i) => (
            <circle 
              key={i} 
              cx={city.x} 
              cy={city.y} 
              r="6" 
              fill="#3b82f6"
              className="cursor-pointer"
            />
          ))}
          
          {/* Draw best path */}
          {acoState.bestPath.length > 0 && acoState.bestPath.map((cityIndex, i) => {
            const nextIndex = (i + 1) % acoState.bestPath.length;
            const city1 = acoState.cities[cityIndex];
            const city2 = acoState.cities[acoState.bestPath[nextIndex]];
            return (
              <line
                key={i}
                x1={city1.x}
                y1={city1.y}
                x2={city2.x}
                y2={city2.y}
                stroke="#ef4444"
                strokeWidth="2"
              />
            );
          })}
          
          {/* Label cities */}
          {acoState.cities.map((city, i) => (
            <text 
              key={i} 
              x={city.x} 
              y={city.y - 10} 
              textAnchor="middle" 
              fontSize="12"
              fill="#1f2937"
            >
              {String.fromCharCode(65 + i)}
            </text>
          ))}
        </svg>
      </div>
    </div>
  );

  const renderNeuron = () => (
    <div className="space-y-4">
      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="font-bold mb-2">Integrate & Fire Neuron</h3>
        <p className="text-sm mb-4">Membrane potential simulation</p>
        
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium">Voltage (mV)</label>
            <div className="text-lg font-mono">{ifState.voltage.toFixed(1)}</div>
          </div>
          <div>
            <label className="block text-sm font-medium">Time (ms)</label>
            <div className="text-lg font-mono">{ifState.time}</div>
          </div>
          <div>
            <label className="block text-sm font-medium">Spike Count</label>
            <div className="text-lg font-mono">{ifState.spikes.length}</div>
          </div>
        </div>
        
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">Input Current (mA)</label>
          <input 
            type="range" 
            min="0" 
            max="30" 
            step="1"
            value={ifState.input}
            onChange={(e) => setIfState(prev => ({...prev, input: parseInt(e.target.value)}))}
            className="w-full"
          />
          <div className="text-sm text-gray-600">{ifState.input} mA</div>
        </div>
      </div>
      
      {ifState.history.length > 0 && (
        <div className="bg-white border rounded-lg p-4">
          <h4 className="font-medium mb-2">Membrane Potential</h4>
          <div className="h-32 border rounded flex items-end justify-between p-2 bg-gray-50 relative">
            <div className="absolute w-full h-px bg-red-400" style={{bottom: '80%'}} title="Threshold (-55mV)" />
            {ifState.history.slice(-50).map((point, i) => {
              const normalizedVoltage = (point.voltage + 80) / 30; // Normalize -80 to -50 mV to 0-1
              return (
                <div 
                  key={i} 
                  className="bg-green-500 w-1"
                  style={{height: `${Math.max(0, normalizedVoltage * 100)}%`}}
                  title={`Time ${point.time}: ${point.voltage.toFixed(1)}mV`}
                />
              );
            })}
          </div>
        </div>
      )}
    </div>
  );

  const renderGA = () => (
    <div className="space-y-4">
      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="font-bold mb-2">Genetic Algorithm</h3>
        <p className="text-sm mb-4">Maximizing f(x) = x² (x ∈ [0, 31])</p>
        
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium">Generation</label>
            <div className="text-lg font-mono bg-blue-100 p-2 rounded">{gaState.generation}</div>
          </div>
          <div>
            <label className="block text-sm font-medium">Best Fitness</label>
            <div className="text-lg font-mono bg-green-100 p-2 rounded">{gaState.bestFitness}</div>
          </div>
        </div>
        
        {gaState.generation > 0 && (
          <div className="bg-purple-50 p-3 rounded mb-4">
            <h4 className="font-medium text-sm mb-1">Evolution Step Analysis:</h4>
            <div className="text-sm">
              <div>• Selection: Fittest individuals chosen for reproduction</div>
              <div>• Crossover: Parent chromosomes combined to create offspring</div>
              <div>• Mutation: Random bit flips introduce genetic diversity</div>
              <div>• Best individual value: {Math.round(Math.sqrt(gaState.bestFitness))}</div>
            </div>
          </div>
        )}
        
        <div>
          <label className="block text-sm font-medium mb-2">Current Population (Binary → Decimal)</label>
          <div className="grid grid-cols-5 gap-2">
            {gaState.population.map((individual, i) => (
              <div 
                key={i} 
                className="p-2 bg-gradient-to-r from-blue-100 to-purple-100 rounded text-sm border"
                title={`Binary: ${individual.toString(2).padStart(5, '0')}, Fitness: ${individual * individual}`}
              >
                <div className="font-mono text-xs">{individual.toString(2).padStart(5, '0')}</div>
                <div className="font-bold text-center">{individual}</div>
                <div className="text-xs text-center text-gray-600">f={individual * individual}</div>
              </div>
            ))}
          </div>
        </div>
        
        <div className="mt-4">
          <label className="block text-sm font-medium mb-2">Population Statistics</label>
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div className="bg-green-50 p-2 rounded">
              <div className="font-medium">Best Individual</div>
              <div>Value: {Math.round(Math.sqrt(gaState.bestFitness))}</div>
              <div>Fitness: {gaState.bestFitness}</div>
            </div>
            <div className="bg-blue-50 p-2 rounded">
              <div className="font-medium">Average Fitness</div>
              <div>{gaState.avgFitness.toFixed(1)}</div>
            </div>
            <div className="bg-purple-50 p-2 rounded">
              <div className="font-medium">Population Diversity</div>
              <div>{new Set(gaState.population).size}/10 unique</div>
            </div>
          </div>
        </div>
      </div>
      
      {gaState.history.length > 0 && (
        <div className="bg-white border rounded-lg p-4">
          <h4 className="font-medium mb-2">Evolution Progress</h4>
          <div className="h-32 border rounded p-2 bg-gray-50 overflow-hidden">
            <div className="h-full flex items-end justify-start gap-1 overflow-x-auto">
              {gaState.history.slice(-15).map((point, i) => (
                <div key={i} className="flex flex-col items-center flex-shrink-0" style={{width: '16px'}}>
                  <div className="text-xs mb-1 text-center whitespace-nowrap">
                    <div className="text-green-600 font-bold text-[9px]">{point.best}</div>
                    <div className="text-gray-500 text-[8px]">{Math.floor(point.avg)}</div>
                  </div>
                  <div 
                    className="bg-green-500 w-2 rounded-t mb-1"
                    style={{height: `${Math.max(2, Math.min(50, (point.best / 961) * 50))}px`}}
                    title={`Gen ${point.gen}: Best ${point.best}`}
                  />
                  <div 
                    className="bg-gray-400 w-2 rounded-t"
                    style={{height: `${Math.max(1, Math.min(30, (point.avg / 961) * 50))}px`}}
                    title={`Gen ${point.gen}: Avg ${point.avg.toFixed(1)}`}
                  />
                  <div className="text-[7px] mt-1 text-gray-600">{point.gen}</div>
                </div>
              ))}
            </div>
          </div>
          <div className="flex justify-center mt-2 text-xs">
            <span className="bg-green-500 w-3 h-3 rounded mr-1"></span>Best Fitness
            <span className="bg-gray-400 w-3 h-3 rounded mr-1 ml-4"></span>Average Fitness
          </div>
        </div>
      )}
    </div>
  );

  const renderSA = () => (
    <div className="space-y-4">
      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="font-bold mb-2">Simulated Annealing</h3>
        <p className="text-sm mb-4">Maximizing f(x) = -(x-2)² + 4</p>
        
        <div className="grid grid-cols-4 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium">Current Solution</label>
            <div className="text-lg font-mono bg-blue-100 p-2 rounded">{saState.current.toFixed(3)}</div>
          </div>
          <div>
            <label className="block text-sm font-medium">Best Found</label>
            <div className="text-lg font-mono bg-green-100 p-2 rounded">{saState.best.toFixed(3)}</div>
          </div>
          <div>
            <label className="block text-sm font-medium">Temperature</label>
            <div className="text-lg font-mono bg-red-100 p-2 rounded">{saState.temperature.toFixed(2)}</div>
          </div>
          <div>
            <label className="block text-sm font-medium">Step Count</label>
            <div className="text-lg font-mono bg-yellow-100 p-2 rounded">{saState.iteration}</div>
          </div>
        </div>
        
        {saState.iteration > 0 && (
          <div className="bg-red-50 p-3 rounded mb-4">
            <h4 className="font-medium text-sm mb-1">Annealing Process:</h4>
            <div className="text-sm">
              <div>• Temperature cooling: {saState.temperature > 10 ? 'Hot - accepts bad moves' : saState.temperature > 1 ? 'Warm - selective acceptance' : 'Cold - only accepts improvements'}</div>
              <div>• Acceptance probability for worse solutions: ~{saState.temperature > 0.01 ? Math.round(Math.exp(-1/saState.temperature) * 100) : 0}%</div>
              <div>• {saState.temperature < 0.1 ? '❄️ System nearly frozen - converging to solution' : '🔥 System still exploring'}</div>
            </div>
          </div>
        )}
      </div>
      
      {saState.history.length > 0 && (
        <div className="bg-white border rounded-lg p-4">
          <h4 className="font-medium mb-2">Annealing Progress</h4>
          <div className="h-48 border rounded bg-gray-50 p-2 overflow-hidden">
            <div className="h-full flex items-end justify-start gap-1 overflow-x-auto">
              {saState.history.slice(-20).map((point, i) => {
                const maxValue = 4; // Maximum possible value of function
                const maxTemp = 100; // Starting temperature
                return (
                  <div key={i} className="flex flex-col items-center flex-shrink-0" style={{width: '18px'}}>
                    <div className="text-xs mb-1 text-center whitespace-nowrap">
                      <div className="text-orange-600 font-bold text-[10px]">{point.value.toFixed(1)}</div>
                      <div className="text-red-500 text-[9px]">{point.temperature.toFixed(0)}</div>
                    </div>
                    <div 
                      className="bg-orange-500 w-4 rounded-t mb-1"
                      style={{height: `${Math.max(3, Math.min(120, (point.value / maxValue) * 120))}px`}}
                      title={`Iter ${point.iteration}: Value ${point.value.toFixed(3)}`}
                    />
                    <div 
                      className="bg-red-500 w-4 rounded-t"
                      style={{height: `${Math.max(2, Math.min(50, (point.temperature / maxTemp) * 50))}px`}}
                      title={`Temperature: ${point.temperature.toFixed(2)}`}
                    />
                    <div className="text-[8px] mt-1 text-gray-600">{point.iteration}</div>
                  </div>
                );
              })}
            </div>
          </div>
          <div className="flex justify-center mt-2 text-xs">
            <span className="bg-orange-500 w-3 h-3 rounded mr-1"></span>Function Value
            <span className="bg-red-500 w-3 h-3 rounded mr-1 ml-4"></span>Temperature
          </div>
          
          <div className="mt-3 grid grid-cols-2 gap-4 text-sm">
            <div className="bg-orange-50 p-2 rounded">
              <div className="font-medium">Current Solution Quality</div>
              <div>f(x) = {(-(saState.current - 2) * (saState.current - 2) + 4).toFixed(3)}</div>
              <div className="text-xs text-gray-600">Maximum possible: 4.000</div>
            </div>
            <div className="bg-red-50 p-2 rounded">
              <div className="font-medium">Temperature Status</div>
              <div>{saState.temperature > 10 ? 'Hot 🔥' : saState.temperature > 1 ? 'Warm 🌡️' : 'Cold ❄️'}</div>
              <div className="text-xs text-gray-600">Cooling rate: 5% per step</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderMcCullochPitts = () => (
    <div className="space-y-4">
      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="font-bold mb-2">McCulloch-Pitts Neuron Model</h3>
        <p className="text-sm mb-4">Interactive Logic Gates</p>
        
        <div className="grid grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium mb-2">AND Gate</h4>
            <div className="space-y-2">
              {[[0,0,0], [0,1,0], [1,0,0], [1,1,1]].map(([x1, x2, out], i) => (
                <div key={i} className="flex items-center space-x-2 text-sm">
                  <span>x1={x1}, x2={x2}</span>
                  <span>→</span>
                  <span>net={x1 + x2}</span>
                  <span>→</span>
                  <span className={out ? 'text-green-600' : 'text-red-600'}>
                    output={out}
                  </span>
                </div>
              ))}
              <div className="text-xs text-gray-600 mt-2">
                Weights: w1=1, w2=1, Threshold=2
              </div>
            </div>
          </div>
          
          <div>
            <h4 className="font-medium mb-2">OR Gate</h4>
            <div className="space-y-2">
              {[[0,0,0], [0,1,1], [1,0,1], [1,1,1]].map(([x1, x2, out], i) => (
                <div key={i} className="flex items-center space-x-2 text-sm">
                  <span>x1={x1}, x2={x2}</span>
                  <span>→</span>
                  <span>net={x1 + x2}</span>
                  <span>→</span>
                  <span className={out ? 'text-green-600' : 'text-red-600'}>
                    output={out}
                  </span>
                </div>
              ))}
              <div className="text-xs text-gray-600 mt-2">
                Weights: w1=1, w2=1, Threshold=1
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="bg-white border rounded-lg p-4">
        <h4 className="font-medium mb-2">Interactive M-P Neuron</h4>
        <MPNeuronInteractive />
      </div>
    </div>
  );

  const MPNeuronInteractive = () => {
    const [inputs, setInputs] = useState([0, 0, 0]);
    const [weights, setWeights] = useState([1, 1, 1]);
    const [threshold, setThreshold] = useState(2);
    
    const netInput = inputs.reduce((sum, input, i) => sum + input * weights[i], 0);
    const output = netInput >= threshold ? 1 : 0;
    
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-3 gap-4">
          {inputs.map((input, i) => (
            <div key={i}>
              <label className="block text-sm font-medium">Input {i + 1}</label>
              <button
                onClick={() => {
                  const newInputs = [...inputs];
                  newInputs[i] = 1 - newInputs[i];
                  setInputs(newInputs);
                }}
                className={`w-full py-2 px-4 rounded ${
                  input ? 'bg-green-500 text-white' : 'bg-gray-200'
                }`}
              >
                {input}
              </button>
            </div>
          ))}
        </div>
        
        <div className="grid grid-cols-3 gap-4">
          {weights.map((weight, i) => (
            <div key={i}>
              <label className="block text-sm font-medium">Weight {i + 1}</label>
              <input
                type="number"
                value={weight}
                onChange={(e) => {
                  const newWeights = [...weights];
                  newWeights[i] = parseFloat(e.target.value) || 0;
                  setWeights(newWeights);
                }}
                className="w-full border rounded px-2 py-1"
              />
            </div>
          ))}
        </div>
        
        <div>
          <label className="block text-sm font-medium">Threshold</label>
          <input
            type="number"
            value={threshold}
            onChange={(e) => setThreshold(parseFloat(e.target.value) || 0)}
            className="w-full border rounded px-2 py-1"
          />
        </div>
        
        <div className="bg-gray-100 p-4 rounded">
          <div className="text-sm space-y-1">
            <div>Net Input = {inputs.map((inp, i) => `${inp}×${weights[i]}`).join(' + ')} = {netInput}</div>
            <div>Condition: {netInput} ≥ {threshold} ? <span className={output ? 'text-green-600' : 'text-red-600'}>
              {output ? 'TRUE' : 'FALSE'}
            </span></div>
            <div className="text-lg font-bold">
              Output: <span className={output ? 'text-green-600' : 'text-red-600'}>{output}</span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderRNN = () => (
    <div className="space-y-4">
      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="font-bold mb-2">Recurrent Neural Network</h3>
        <p className="text-sm mb-4">Simple RNN for sequence processing</p>
        
        <RNNDemo />
      </div>
    </div>
  );

  const RNNDemo = () => {
    const [sequence, setSequence] = useState('HELLO');
    const [hiddenState, setHiddenState] = useState([0.5, 0.3]);
    const [timeStep, setTimeStep] = useState(0);
    const [isProcessing, setIsProcessing] = useState(false);

    const charToVec = (char: string) => {
      const code = char.charCodeAt(0) - 65; // A=0, B=1, etc.
      return [(code % 4) / 4, Math.floor(code / 4) / 6];
    };

    const processSequence = () => {
      setIsProcessing(true);
      setTimeStep(0);
      setHiddenState([0.5, 0.3]);
      
      const process = (step: number) => {
        if (step >= sequence.length) {
          setIsProcessing(false);
          return;
        }
        
        const char = sequence[step];
        const input = charToVec(char);
        
        // Simple RNN computation: h_t = tanh(W_hh * h_{t-1} + W_xh * x_t)
        const newHidden = [
          Math.tanh(0.5 * hiddenState[0] + 0.3 * hiddenState[1] + 0.7 * input[0] + 0.2 * input[1]),
          Math.tanh(0.4 * hiddenState[0] + 0.6 * hiddenState[1] + 0.1 * input[0] + 0.8 * input[1])
        ];
        
        setHiddenState(newHidden);
        setTimeStep(step + 1);
        
        setTimeout(() => process(step + 1), 2000); // Slower for better understanding
      };
      
      process(0);
    };

    return (
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">Input Sequence</label>
          <input
            type="text"
            value={sequence}
            onChange={(e) => setSequence(e.target.value.toUpperCase())}
            className="w-full border rounded px-2 py-1"
            maxLength={10}
          />
        </div>
        
        <button
          onClick={processSequence}
          disabled={isProcessing}
          className={`px-4 py-2 rounded ${
            isProcessing 
              ? 'bg-gray-400 cursor-not-allowed' 
              : 'bg-blue-500 hover:bg-blue-600 text-white'
          }`}
        >
          {isProcessing ? 'Processing...' : 'Process Sequence'}
        </button>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium">Current Time Step</label>
            <div className="text-2xl font-mono">{timeStep}/{sequence.length}</div>
            {timeStep > 0 && (
              <div className="text-sm">
                Processing: <span className="font-mono">{sequence[timeStep - 1]}</span>
              </div>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium">Hidden State</label>
            <div className="text-sm font-mono">
              [{hiddenState[0].toFixed(3)}, {hiddenState[1].toFixed(3)}]
            </div>
          </div>
        </div>
        
        <div className="bg-white border rounded p-3">
          <h5 className="font-medium mb-2">Sequence Visualization</h5>
          <div className="flex space-x-2">
            {sequence.split('').map((char, i) => (
              <div
                key={i}
                className={`w-8 h-8 border rounded flex items-center justify-center text-sm ${
                  i < timeStep 
                    ? 'bg-green-200 border-green-400' 
                    : i === timeStep && isProcessing
                    ? 'bg-yellow-200 border-yellow-400'
                    : 'bg-gray-100'
                }`}
              >
                {char}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderNetworkArchitecture = () => (
    <div className="space-y-4">
      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="font-bold mb-2">Network Architecture Visualization</h3>
        <p className="text-sm mb-4">Interactive neural network architectures</p>
        
        <NetworkArchitectureDemo />
      </div>
    </div>
  );

  const NetworkArchitectureDemo = () => {
    const [architecture, setArchitecture] = useState('feedforward');
    const [layers, setLayers] = useState([3, 4, 2]);

    const architectures = {
      feedforward: 'Feedforward Network',
      cnn: 'Convolutional Network',
      rnn: 'Recurrent Network',
      autoencoder: 'Autoencoder'
    };

    const renderNetwork = () => {
      switch(architecture) {
        case 'feedforward':
          return renderFeedforwardNetwork();
        case 'cnn':
          return renderCNNArchitecture();
        case 'rnn':
          return renderRNNArchitecture();
        case 'autoencoder':
          return renderAutoencoderArchitecture();
        default:
          return null;
      }
    };

    const renderFeedforwardNetwork = () => (
      <svg width="400" height="200" className="border rounded bg-white">
        {layers.map((layerSize, layerIndex) => {
          const x = 50 + layerIndex * 120;
          return (
            <g key={layerIndex}>
              {/* Layer label */}
              <text x={x} y={20} textAnchor="middle" fontSize="12" fill="#666">
                {layerIndex === 0 ? 'Input' : layerIndex === layers.length - 1 ? 'Output' : 'Hidden'}
              </text>
              
              {/* Neurons */}
              {Array(layerSize).fill(0).map((_, neuronIndex) => {
                const y = 40 + (neuronIndex * (140 / layerSize)) + (140 / layerSize / 2);
                return (
                  <circle
                    key={neuronIndex}
                    cx={x}
                    cy={y}
                    r="8"
                    fill="#3b82f6"
                    stroke="#1e40af"
                    strokeWidth="1"
                  />
                );
              })}
              
              {/* Connections to next layer */}
              {layerIndex < layers.length - 1 && Array(layerSize).fill(0).map((_, fromNeuron) => {
                const fromY = 40 + (fromNeuron * (140 / layerSize)) + (140 / layerSize / 2);
                return Array(layers[layerIndex + 1]).fill(0).map((_, toNeuron) => {
                  const toY = 40 + (toNeuron * (140 / layers[layerIndex + 1])) + (140 / layers[layerIndex + 1] / 2);
                  return (
                    <line
                      key={`${fromNeuron}-${toNeuron}`}
                      x1={x + 8}
                      y1={fromY}
                      x2={x + 120 - 8}
                      y2={toY}
                      stroke="#94a3b8"
                      strokeWidth="1"
                      opacity="0.6"
                    />
                  );
                });
              })}
            </g>
          );
        })}
      </svg>
    );

    const renderCNNArchitecture = () => (
      <svg width="500" height="200" className="border rounded bg-white">
        <g>
          {/* Input */}
          <rect x="20" y="60" width="40" height="40" fill="#e5e7eb" stroke="#6b7280" />
          <text x="40" y="110" textAnchor="middle" fontSize="10">Input</text>
          
          {/* Conv Layer */}
          <rect x="90" y="50" width="30" height="30" fill="#3b82f6" stroke="#1e40af" />
          <rect x="95" y="55" width="30" height="30" fill="#3b82f6" stroke="#1e40af" opacity="0.7" />
          <text x="110" y="110" textAnchor="middle" fontSize="10">Conv</text>
          
          {/* Pooling */}
          <rect x="150" y="65" width="20" height="20" fill="#10b981" stroke="#059669" />
          <text x="160" y="110" textAnchor="middle" fontSize="10">Pool</text>
          
          {/* Conv Layer 2 */}
          <rect x="200" y="45" width="25" height="25" fill="#3b82f6" stroke="#1e40af" />
          <rect x="205" y="50" width="25" height="25" fill="#3b82f6" stroke="#1e40af" opacity="0.7" />
          <text x="215" y="110" textAnchor="middle" fontSize="10">Conv</text>
          
          {/* Pooling 2 */}
          <rect x="255" y="60" width="15" height="15" fill="#10b981" stroke="#059669" />
          <text x="262" y="110" textAnchor="middle" fontSize="10">Pool</text>
          
          {/* Fully Connected */}
          <circle cx="320" cy="60" r="6" fill="#f59e0b" />
          <circle cx="320" cy="80" r="6" fill="#f59e0b" />
          <circle cx="320" cy="100" r="6" fill="#f59e0b" />
          <text x="320" y="125" textAnchor="middle" fontSize="10">FC</text>
          
          {/* Output */}
          <circle cx="380" cy="70" r="8" fill="#ef4444" />
          <circle cx="380" cy="90" r="8" fill="#ef4444" />
          <text x="380" y="115" textAnchor="middle" fontSize="10">Output</text>
          
          {/* Arrows */}
          {[[60, 75, 90, 75], [120, 75, 150, 75], [170, 75, 200, 75], [225, 75, 255, 75], [270, 75, 300, 75], [340, 75, 360, 75]].map(([x1, y1, x2, y2], i) => (
            <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#374151" strokeWidth="2" markerEnd="url(#arrowhead)" />
          ))}
          
          <defs>
            <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
              <polygon points="0 0, 10 3.5, 0 7" fill="#374151" />
            </marker>
          </defs>
        </g>
      </svg>
    );

    const renderRNNArchitecture = () => (
      <svg width="400" height="200" className="border rounded bg-white">
        <g>
          {/* Time steps */}
          {[0, 1, 2].map(t => (
            <g key={t}>
              <text x={60 + t * 100} y={30} textAnchor="middle" fontSize="12" fill="#666">
                t = {t}
              </text>
              
              {/* Input */}
              <rect x={50 + t * 100} y={150} width={20} height={20} fill="#e5e7eb" stroke="#6b7280" />
              <text x={60 + t * 100} y={185} textAnchor="middle" fontSize="10">x_{t}</text>
              
              {/* Hidden state */}
              <circle cx={60 + t * 100} cy={100} r="15" fill="#3b82f6" stroke="#1e40af" strokeWidth="2" />
              <text x={60 + t * 100} y={105} textAnchor="middle" fontSize="10" fill="white">h</text>
              
              {/* Output */}
              <rect x={50 + t * 100} y={50} width={20} height={20} fill="#ef4444" stroke="#dc2626" />
              <text x={60 + t * 100} y={45} textAnchor="middle" fontSize="10">y_{t}</text>
              
              {/* Connections */}
              <line x1={60 + t * 100} y1={150} x2={60 + t * 100} y2={115} stroke="#374151" strokeWidth="2" markerEnd="url(#arrowhead)" />
              <line x1={60 + t * 100} y1={85} x2={60 + t * 100} y2={70} stroke="#374151" strokeWidth="2" markerEnd="url(#arrowhead)" />
              
              {/* Recurrent connection */}
              {t > 0 && (
                <path 
                  d={`M ${60 + (t-1) * 100 + 15} 100 Q ${60 + (t-1) * 100 + 50} 80 ${60 + t * 100 - 15} 100`}
                  stroke="#10b981" 
                  strokeWidth="2" 
                  fill="none" 
                  markerEnd="url(#arrowhead-green)"
                />
              )}
            </g>
          ))}
          
          <defs>
            <marker id="arrowhead-green" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
              <polygon points="0 0, 10 3.5, 0 7" fill="#10b981" />
            </marker>
          </defs>
        </g>
      </svg>
    );

    const renderAutoencoderArchitecture = () => (
      <svg width="400" height="200" className="border rounded bg-white">
        <g>
          {/* Input */}
          {[0, 1, 2, 3].map(i => (
            <circle key={i} cx="40" cy={50 + i * 25} r="6" fill="#3b82f6" />
          ))}
          <text x="40" y="180" textAnchor="middle" fontSize="10">Input</text>
          
          {/* Encoder hidden */}
          {[0, 1, 2].map(i => (
            <circle key={i} cx="120" cy={60 + i * 25} r="6" fill="#10b981" />
          ))}
          <text x="120" y="180" textAnchor="middle" fontSize="10">Encoder</text>
          
          {/* Bottleneck */}
          {[0, 1].map(i => (
            <circle key={i} cx="200" cy={75 + i * 25} r="8" fill="#f59e0b" />
          ))}
          <text x="200" y="180" textAnchor="middle" fontSize="10">Bottleneck</text>
          
          {/* Decoder hidden */}
          {[0, 1, 2].map(i => (
            <circle key={i} cx="280" cy={60 + i * 25} r="6" fill="#8b5cf6" />
          ))}
          <text x="280" y="180" textAnchor="middle" fontSize="10">Decoder</text>
          
          {/* Output */}
          {[0, 1, 2, 3].map(i => (
            <circle key={i} cx="360" cy={50 + i * 25} r="6" fill="#ef4444" />
          ))}
          <text x="360" y="180" textAnchor="middle" fontSize="10">Output</text>
          
          {/* Connections */}
          {/* Input to encoder */}
          {[0, 1, 2, 3].map(i => (
            [0, 1, 2].map(j => (
              <line key={`${i}-${j}`} x1="46" y1={50 + i * 25} x2="114" y2={60 + j * 25} stroke="#94a3b8" strokeWidth="1" opacity="0.6" />
            ))
          ))}
          
          {/* Encoder to bottleneck */}
          {[0, 1, 2].map(i => (
            [0, 1].map(j => (
              <line key={`${i}-${j}`} x1="126" y1={60 + i * 25} x2="192" y2={75 + j * 25} stroke="#94a3b8" strokeWidth="1" opacity="0.6" />
            ))
          ))}
          
          {/* Bottleneck to decoder */}
          {[0, 1].map(i => (
            [0, 1, 2].map(j => (
              <line key={`${i}-${j}`} x1="208" y1={75 + i * 25} x2="274" y2={60 + j * 25} stroke="#94a3b8" strokeWidth="1" opacity="0.6" />
            ))
          ))}
          
          {/* Decoder to output */}
          {[0, 1, 2].map(i => (
            [0, 1, 2, 3].map(j => (
              <line key={`${i}-${j}`} x1="286" y1={60 + i * 25} x2="354" y2={50 + j * 25} stroke="#94a3b8" strokeWidth="1" opacity="0.6" />
            ))
          ))}
        </g>
      </svg>
    );

    return (
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">Architecture Type</label>
          <select
            value={architecture}
            onChange={(e) => setArchitecture(e.target.value)}
            className="w-full border rounded px-2 py-1"
          >
            {Object.entries(architectures).map(([key, name]) => (
              <option key={key} value={key}>{name}</option>
            ))}
          </select>
        </div>
        
        {architecture === 'feedforward' && (
          <div>
            <label className="block text-sm font-medium mb-2">Layer Sizes</label>
            <div className="flex space-x-2">
              {layers.map((size, i) => (
                <input
                  key={i}
                  type="number"
                  min="1"
                  max="8"
                  value={size}
                  onChange={(e) => {
                    const newLayers = [...layers];
                    newLayers[i] = parseInt(e.target.value) || 1;
                    setLayers(newLayers);
                  }}
                  className="w-16 border rounded px-2 py-1"
                />
              ))}
            </div>
          </div>
        )}
        
        <div className="bg-white border rounded p-4">
          <h5 className="font-medium mb-2">{architectures[architecture as keyof typeof architectures]}</h5>
          {renderNetwork()}
        </div>
        
        <div className="text-sm text-gray-600">
          <h5 className="font-medium mb-1">Architecture Details:</h5>
          {architecture === 'feedforward' && (
            <p>Feedforward networks process information in one direction from input to output through hidden layers.</p>
          )}
          {architecture === 'cnn' && (
            <p>CNNs use convolutional and pooling layers to extract spatial features, commonly used for image processing.</p>
          )}
          {architecture === 'rnn' && (
            <p>RNNs have recurrent connections that allow them to maintain memory and process sequential data.</p>
          )}
          {architecture === 'autoencoder' && (
            <p>Autoencoders compress input through a bottleneck layer and reconstruct it, used for dimensionality reduction.</p>
          )}
        </div>
      </div>
    );
  };

  const models = [
    { id: 'hillclimbing', name: 'Hill Climbing', component: renderHillClimbing },
    { id: 'aco', name: 'Ant Colony Optimization', component: renderACO },
    { id: 'neuron', name: 'Integrate & Fire Neuron', component: renderNeuron },
    { id: 'rnn', name: 'Recurrent Network', component: renderRNN },
    { id: 'genetic', name: 'Genetic Algorithm', component: renderGA },
    { id: 'annealing', name: 'Simulated Annealing', component: renderSA },
    { id: 'architecture', name: 'Network Architecture', component: renderNetworkArchitecture },
    { id: 'mcculloch', name: 'McCulloch-Pitts Model', component: renderMcCullochPitts }
  ];

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Nature Inspired Computing - Interactive Models
        </h1>
        <p className="text-gray-600">
          Explore working implementations of nature-inspired algorithms and neural network models
        </p>
      </div>

      {/* Model Selection */}
      <div className="mb-6">
        <div className="flex flex-wrap gap-2">
          {models.map(model => (
            <button
              key={model.id}
              onClick={() => {
                setActiveModel(model.id);
                stopSimulation();
              }}
              className={`px-4 py-2 rounded-lg border ${
                activeModel === model.id
                  ? 'bg-blue-500 text-white border-blue-500'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
              }`}
            >
              {model.name}
            </button>
          ))}
        </div>
      </div>

      {/* Control Panel */}
      {!['mcculloch', 'architecture', 'rnn'].includes(activeModel) && (
        <div className="mb-6 bg-white border rounded-lg p-4">
          <div className="flex items-center space-x-4">
            <button
              onClick={isRunning ? stopSimulation : startSimulation}
              className={`px-4 py-2 rounded-lg flex items-center space-x-2 ${
                isRunning
                  ? 'bg-red-500 hover:bg-red-600 text-white'
                  : 'bg-green-500 hover:bg-green-600 text-white'
              }`}
            >
              {isRunning ? <Pause size={16} /> : <Play size={16} />}
              <span>{isRunning ? 'Stop' : 'Start'}</span>
            </button>
            
            <button
              onClick={resetSimulation}
              className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg flex items-center space-x-2"
            >
              <RotateCcw size={16} />
              <span>Reset</span>
            </button>
            
            <div className="text-sm text-gray-600">
              <div className="font-medium">Speed: {
                activeModel === 'hillclimbing' ? 'Slow (800ms/step)' :
                activeModel === 'aco' ? 'Very Slow (1200ms/step)' :
                activeModel === 'neuron' ? 'Slow (200ms/step)' :
                activeModel === 'genetic' ? 'Very Slow (1500ms/step)' :
                activeModel === 'annealing' ? 'Medium (600ms/step)' : 'Medium'
              }</div>
              <div>Watch each step carefully to understand the algorithm behavior</div>
            </div>
          </div>
        </div>
      )}

      {/* Active Model */}
      <div className="bg-white border rounded-lg p-6">
        {models.find(m => m.id === activeModel)?.component()}
      </div>

      {/* Footer */}
      <div className="mt-8 text-center text-sm text-gray-500">
        <p>
          Interactive demonstrations of nature-inspired computing algorithms.
          Adjust parameters and observe real-time behavior.
        </p>
      </div>
    </div>
  );
};

export default NatureInspiredComputingModels;
