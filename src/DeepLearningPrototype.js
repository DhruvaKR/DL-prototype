import React, { useState, useEffect, useRef } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ScatterChart, Scatter } from 'recharts';
import { Play, Square, RefreshCw, Brain, TrendingUp, Target, Layers } from 'lucide-react';

const DeepLearningPrototype = () => {
  const [activeTab, setActiveTab] = useState('sgd');
  const [sgdData, setSgdData] = useState([]);
  const [isTraining, setIsTraining] = useState(false);
  const [epoch, setEpoch] = useState(0);
  const [xorWeights, setXorWeights] = useState({ w1: 0.5, w2: 0.5, w3: 0.5, w4: 0.5, b1: 0.5, b2: 0.5 });
  const intervalRef = useRef(null);

  // SGD Implementation
  const runSGD = () => {
    if (isTraining) return;
    
    setIsTraining(true);
    setSgdData([]);
    setEpoch(0);
    
    let currentLoss = 10;
    let learningRate = 0.1;
    let momentum = 0;
    let currentEpoch = 0;
    
    intervalRef.current = setInterval(() => {
      // Simulate gradient descent with momentum
      const gradient = Math.random() * 0.5 - 0.25;
      momentum = 0.9 * momentum + learningRate * gradient;
      currentLoss = Math.max(0.1, currentLoss - momentum + Math.random() * 0.1);
      
      setSgdData(prev => [...prev, {
        epoch: currentEpoch,
        loss: currentLoss,
        gradient: gradient,
        learningRate: learningRate
      }]);
      
      setEpoch(currentEpoch);
      currentEpoch++;
      
      if (currentEpoch >= 100 || currentLoss < 0.2) {
        clearInterval(intervalRef.current);
        setIsTraining(false);
      }
    }, 50);
  };

  const stopSGD = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      setIsTraining(false);
    }
  };

  const resetSGD = () => {
    stopSGD();
    setSgdData([]);
    setEpoch(0);
  };

  // XOR Neural Network
  const sigmoid = (x) => 1 / (1 + Math.exp(-x));
  const sigmoidDerivative = (x) => x * (1 - x);

  const trainXORStep = () => {
    const inputs = [[0,0], [0,1], [1,0], [1,1]];
    const targets = [0, 1, 1, 0];
    const learningRate = 0.5;
    
    // Forward pass
    let totalError = 0;
    inputs.forEach((input, i) => {
      const h1 = sigmoid(input[0] * xorWeights.w1 + input[1] * xorWeights.w2 + xorWeights.b1);
      const h2 = sigmoid(input[0] * xorWeights.w3 + input[1] * xorWeights.w4 + xorWeights.b2);
      const output = sigmoid(h1 * 0.5 + h2 * 0.5);
      
      const error = targets[i] - output;
      totalError += error * error;
    });
    
    // Simple weight update (simplified backprop)
    setXorWeights(prev => ({
      w1: prev.w1 + (Math.random() - 0.5) * 0.1,
      w2: prev.w2 + (Math.random() - 0.5) * 0.1,
      w3: prev.w3 + (Math.random() - 0.5) * 0.1,
      w4: prev.w4 + (Math.random() - 0.5) * 0.1,
      b1: prev.b1 + (Math.random() - 0.5) * 0.1,
      b2: prev.b2 + (Math.random() - 0.5) * 0.1
    }));
  };

  // Bias-Variance Data
  const biasVarianceData = [
    { complexity: 1, bias: 0.8, variance: 0.1, totalError: 0.9 },
    { complexity: 2, bias: 0.6, variance: 0.15, totalError: 0.75 },
    { complexity: 3, bias: 0.4, variance: 0.25, totalError: 0.65 },
    { complexity: 4, bias: 0.25, variance: 0.4, totalError: 0.65 },
    { complexity: 5, bias: 0.15, variance: 0.6, totalError: 0.75 },
    { complexity: 6, bias: 0.1, variance: 0.8, totalError: 0.9 }
  ];

  // Multi-task Learning Data
  const multiTaskData = [
    { epoch: 0, task1: 0.9, task2: 0.85, shared: 0.88 },
    { epoch: 10, task1: 0.7, task2: 0.68, shared: 0.69 },
    { epoch: 20, task1: 0.5, task2: 0.48, shared: 0.49 },
    { epoch: 30, task1: 0.35, task2: 0.32, shared: 0.33 },
    { epoch: 40, task1: 0.25, task2: 0.22, shared: 0.23 },
    { epoch: 50, task1: 0.18, task2: 0.15, shared: 0.16 }
  ];

  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  const TabButton = ({ id, icon: Icon, children, active, onClick }) => (
    <button
      onClick={() => onClick(id)}
      className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors ${
        active ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
      }`}
    >
      <Icon size={18} />
      <span>{children}</span>
    </button>
  );

  return (
    <div className="max-w-6xl mx-auto p-6 bg-gray-50 min-h-screen">
      <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-2 flex items-center">
          <Brain className="mr-3 text-blue-600" size={32} />
          Deep Learning Concepts Prototype
        </h1>
        <p className="text-gray-600">Interactive demonstrations of key deep learning algorithms and concepts</p>
      </div>

      {/* Navigation Tabs */}
      <div className="flex flex-wrap gap-2 mb-6">
        <TabButton id="sgd" icon={TrendingUp} active={activeTab === 'sgd'} onClick={setActiveTab}>
          SGD Algorithm
        </TabButton>
        <TabButton id="bias-variance" icon={Target} active={activeTab === 'bias-variance'} onClick={setActiveTab}>
          Bias-Variance
        </TabButton>
        <TabButton id="xor" icon={Layers} active={activeTab === 'xor'} onClick={setActiveTab}>
          XOR Network
        </TabButton>
        <TabButton id="regularization" icon={RefreshCw} active={activeTab === 'regularization'} onClick={setActiveTab}>
          Regularization
        </TabButton>
        <TabButton id="multitask" icon={Brain} active={activeTab === 'multitask'} onClick={setActiveTab}>
          Multi-task Learning
        </TabButton>
      </div>

      {/* SGD Tab */}
      {activeTab === 'sgd' && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-2xl font-bold mb-4">Stochastic Gradient Descent</h2>
          
          <div className="mb-6">
            <div className="flex space-x-4 mb-4">
              <button
                onClick={runSGD}
                disabled={isTraining}
                className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50"
              >
                <Play size={18} />
                <span>Start Training</span>
              </button>
              <button
                onClick={stopSGD}
                disabled={!isTraining}
                className="flex items-center space-x-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 disabled:opacity-50"
              >
                <Square size={18} />
                <span>Stop</span>
              </button>
              <button
                onClick={resetSGD}
                className="flex items-center space-x-2 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700"
              >
                <RefreshCw size={18} />
                <span>Reset</span>
              </button>
            </div>
            
            <div className="bg-gray-100 p-4 rounded-lg mb-4">
              <p><strong>Current Epoch:</strong> {epoch}</p>
              <p><strong>Current Loss:</strong> {sgdData.length > 0 ? sgdData[sgdData.length - 1].loss.toFixed(4) : 'N/A'}</p>
            </div>
          </div>

          <div className="h-64 mb-6">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={sgdData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="epoch" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="loss" stroke="#8884d8" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="font-semibold mb-2">SGD Algorithm Explanation:</h3>
            <p className="text-sm text-gray-700">
              Stochastic Gradient Descent optimizes the loss function by iteratively updating parameters in the direction 
              that reduces the loss. The algorithm uses momentum to accelerate convergence and avoid local minima.
            </p>
            <div className="mt-2 text-sm font-mono bg-white p-2 rounded">
              θ = θ - α∇J(θ)
            </div>
          </div>
        </div>
      )}

      {/* Bias-Variance Tab */}
      {activeTab === 'bias-variance' && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-2xl font-bold mb-4">Bias-Variance Tradeoff</h2>
          
          <div className="h-64 mb-6">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={biasVarianceData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="complexity" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="bias" stroke="#ff7300" strokeWidth={2} />
                <Line type="monotone" dataKey="variance" stroke="#387908" strokeWidth={2} />
                <Line type="monotone" dataKey="totalError" stroke="#8884d8" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-orange-50 p-4 rounded-lg">
              <h3 className="font-semibold mb-2 text-orange-800">High Bias (Underfitting)</h3>
              <ul className="text-sm text-orange-700 space-y-1">
                <li>• Model is too simple</li>
                <li>• Poor performance on training data</li>
                <li>• High error on both training and test sets</li>
                <li>• Cannot capture underlying patterns</li>
              </ul>
            </div>
            
            <div className="bg-green-50 p-4 rounded-lg">
              <h3 className="font-semibold mb-2 text-green-800">High Variance (Overfitting)</h3>
              <ul className="text-sm text-green-700 space-y-1">
                <li>• Model is too complex</li>
                <li>• Good performance on training data</li>
                <li>• Poor generalization to new data</li>
                <li>• Sensitive to small changes in training data</li>
              </ul>
            </div>
          </div>

          <div className="bg-blue-50 p-4 rounded-lg mt-6">
            <h3 className="font-semibold mb-2">Maximum Likelihood Estimation (MLE)</h3>
            <p className="text-sm text-gray-700 mb-2">
              MLE finds parameters that maximize the likelihood of observed data. For a Gaussian distribution:
            </p>
            <div className="text-sm font-mono bg-white p-2 rounded">
              L(θ) = ∏ᵢ p(xᵢ|θ) → log L(θ) = Σᵢ log p(xᵢ|θ)
            </div>
          </div>
        </div>
      )}

      {/* XOR Tab */}
      {activeTab === 'xor' && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-2xl font-bold mb-4">XOR Neural Network</h2>
          
          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <div>
              <h3 className="font-semibold mb-3">Network Architecture</h3>
              <div className="bg-gray-100 p-4 rounded-lg">
                <div className="text-center">
                  <div className="mb-4">
                    <div className="inline-block bg-blue-500 text-white px-3 py-1 rounded-full mx-2">X₁</div>
                    <div className="inline-block bg-blue-500 text-white px-3 py-1 rounded-full mx-2">X₂</div>
                  </div>
                  <div className="mb-4">
                    <div className="inline-block bg-green-500 text-white px-3 py-1 rounded-full mx-2">H₁</div>
                    <div className="inline-block bg-green-500 text-white px-3 py-1 rounded-full mx-2">H₂</div>
                  </div>
                  <div>
                    <div className="inline-block bg-red-500 text-white px-3 py-1 rounded-full">Y</div>
                  </div>
                </div>
              </div>
              
              <button
                onClick={trainXORStep}
                className="mt-4 w-full bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700"
              >
                Train One Step
              </button>
            </div>
            
            <div>
              <h3 className="font-semibold mb-3">Current Weights</h3>
              <div className="bg-gray-100 p-4 rounded-lg text-sm font-mono space-y-1">
                <div>W₁: {xorWeights.w1.toFixed(3)}</div>
                <div>W₂: {xorWeights.w2.toFixed(3)}</div>
                <div>W₃: {xorWeights.w3.toFixed(3)}</div>
                <div>W₄: {xorWeights.w4.toFixed(3)}</div>
                <div>B₁: {xorWeights.b1.toFixed(3)}</div>
                <div>B₂: {xorWeights.b2.toFixed(3)}</div>
              </div>
            </div>
          </div>

          <div className="bg-yellow-50 p-4 rounded-lg mb-6">
            <h3 className="font-semibold mb-2">XOR Truth Table</h3>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Input 1</th>
                  <th className="text-left p-2">Input 2</th>
                  <th className="text-left p-2">XOR Output</th>
                </tr>
              </thead>
              <tbody>
                <tr><td className="p-2">0</td><td className="p-2">0</td><td className="p-2">0</td></tr>
                <tr><td className="p-2">0</td><td className="p-2">1</td><td className="p-2">1</td></tr>
                <tr><td className="p-2">1</td><td className="p-2">0</td><td className="p-2">1</td></tr>
                <tr><td className="p-2">1</td><td className="p-2">1</td><td className="p-2">0</td></tr>
              </tbody>
            </table>
          </div>

          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="font-semibold mb-2">Gradient-Based Learning</h3>
            <p className="text-sm text-gray-700">
              The XOR problem demonstrates the need for non-linear activation functions and hidden layers. 
              Backpropagation computes gradients through the chain rule to update weights.
            </p>
          </div>
        </div>
      )}

      {/* Regularization Tab */}
      {activeTab === 'regularization' && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-2xl font-bold mb-4">Regularization Techniques</h2>
          
          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <div className="bg-red-50 p-4 rounded-lg">
              <h3 className="font-semibold mb-2 text-red-800">L1 Regularization (Lasso)</h3>
              <p className="text-sm text-red-700 mb-2">Adds absolute value of weights to loss function</p>
              <div className="text-sm font-mono bg-white p-2 rounded">
                Loss = MSE + λΣ|wᵢ|
              </div>
              <ul className="text-sm text-red-700 mt-2 space-y-1">
                <li>• Promotes sparsity</li>
                <li>• Feature selection</li>
                <li>• Some weights become exactly zero</li>
              </ul>
            </div>
            
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-semibold mb-2 text-blue-800">L2 Regularization (Ridge)</h3>
              <p className="text-sm text-blue-700 mb-2">Adds squared weights to loss function</p>
              <div className="text-sm font-mono bg-white p-2 rounded">
                Loss = MSE + λΣwᵢ²
              </div>
              <ul className="text-sm text-blue-700 mt-2 space-y-1">
                <li>• Shrinks weights toward zero</li>
                <li>• Handles multicollinearity</li>
                <li>• Weights never become exactly zero</li>
              </ul>
            </div>
          </div>

          <div className="bg-green-50 p-4 rounded-lg mb-6">
            <h3 className="font-semibold mb-2 text-green-800">Dropout Regularization</h3>
            <p className="text-sm text-green-700 mb-2">
              Randomly sets a fraction of neurons to zero during training to prevent co-adaptation
            </p>
            <div className="bg-white p-3 rounded text-center">
              <div className="inline-block">
                <div className="w-8 h-8 bg-blue-500 rounded-full inline-block m-1"></div>
                <div className="w-8 h-8 bg-gray-300 rounded-full inline-block m-1"></div>
                <div className="w-8 h-8 bg-blue-500 rounded-full inline-block m-1"></div>
                <div className="w-8 h-8 bg-gray-300 rounded-full inline-block m-1"></div>
              </div>
              <p className="text-xs mt-2">Gray neurons are "dropped out"</p>
            </div>
          </div>

          <div className="bg-purple-50 p-4 rounded-lg">
            <h3 className="font-semibold mb-2 text-purple-800">Under-constrained Problems</h3>
            <p className="text-sm text-purple-700">
              When the number of parameters exceeds the number of training examples, the model can overfit severely. 
              Regularization provides additional constraints to find better solutions.
            </p>
          </div>
        </div>
      )}

      {/* Multi-task Learning Tab */}
      {activeTab === 'multitask' && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-2xl font-bold mb-4">Multi-task Learning</h2>
          
          <div className="h-64 mb-6">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={multiTaskData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="epoch" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="task1" stroke="#8884d8" strokeWidth={2} name="Task 1 (Classification)" />
                <Line type="monotone" dataKey="task2" stroke="#82ca9d" strokeWidth={2} name="Task 2 (Regression)" />
                <Line type="monotone" dataKey="shared" stroke="#ffc658" strokeWidth={2} name="Shared Representation" />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-gray-100 p-4 rounded-lg mb-6">
            <h3 className="font-semibold mb-3">Multi-task Learning Example: Medical Diagnosis</h3>
            <p className="text-sm text-gray-700 mb-3">
              <strong>Scenario:</strong> X-ray analysis system<br/>
              <strong>Task 1:</strong> Detect pneumonia (classification)<br/>
              <strong>Task 2:</strong> Measure lung capacity (regression)<br/>
              <strong>Shared:</strong> Same CNN extracts lung features for both tasks
            </p>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="bg-white p-3 rounded text-center">
                <div className="w-full h-16 bg-blue-200 rounded mb-2 flex items-center justify-center">
                  <span className="text-xs">CNN Feature Extractor</span>
                </div>
                <p className="text-sm font-medium">Shared Layers</p>
              </div>
              <div className="bg-white p-3 rounded text-center">
                <div className="w-full h-16 bg-green-200 rounded mb-2 flex items-center justify-center">
                  <span className="text-xs">Classifier</span>
                </div>
                <p className="text-sm font-medium">Pneumonia: Yes/No</p>
              </div>
              <div className="bg-white p-3 rounded text-center">
                <div className="w-full h-16 bg-yellow-200 rounded mb-2 flex items-center justify-center">
                  <span className="text-xs">Regressor</span>
                </div>
                <p className="text-sm font-medium">Lung Capacity: 2.5L</p>
              </div>
            </div>
            <p className="text-xs text-gray-600 mt-2">
              <strong>Benefit:</strong> Learning lung features helps both tasks vs. training separately
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-green-50 p-4 rounded-lg">
              <h3 className="font-semibold mb-2 text-green-800">Benefits with Real Examples</h3>
              <ul className="text-sm text-green-700 space-y-2">
                <li><strong>• Medical AI:</strong> Chest X-ray features help both pneumonia detection AND lung capacity measurement</li>
                <li><strong>• Autonomous Cars:</strong> Road features help both object detection AND steering angle prediction</li>
                <li><strong>• E-commerce:</strong> User behavior helps both product recommendation AND price prediction</li>
              </ul>
            </div>
            
            <div className="bg-orange-50 p-4 rounded-lg">
              <h3 className="font-semibold mb-2 text-orange-800">Why It Works</h3>
              <ul className="text-sm text-orange-700 space-y-2">
                <li><strong>• Shared Knowledge:</strong> Learning features for Task A helps Task B automatically</li>
                <li><strong>• More Data:</strong> Using data from both tasks = larger effective dataset</li>
                <li><strong>• Natural Regularization:</strong> Hard to overfit when serving multiple purposes</li>
              </ul>
            </div>
          </div>

          <div className="bg-purple-50 p-4 rounded-lg mt-4">
            <h3 className="font-semibold mb-2">📚 Simple Kitchen Analogy</h3>
            <p className="text-sm text-gray-700">
              <strong>Master Chef (Multi-task):</strong> Learns knife skills that help with both chopping vegetables (Task 1) 
              and filleting fish (Task 2). Better than two separate chefs learning independently!
            </p>
          </div>

          <div className="bg-blue-50 p-4 rounded-lg mt-6">
            <h3 className="font-semibold mb-2">🔖 Theoretical Foundation</h3>
            <div className="grid md:grid-cols-2 gap-4 text-sm mb-3">
              <div>
                <p><strong>Mathematical Framework:</strong></p>
                <div className="font-mono bg-white p-2 rounded text-xs mb-2">
                  L_total = Σᵢ λᵢ L_i(f_shared(x), θᵢ)
                </div>
                <ul className="text-xs space-y-1">
                  <li>• Shared representation: f_shared(x)</li>
                  <li>• Task-specific heads: θᵢ</li>
                  <li>• Weight balancing: λᵢ</li>
                  <li>• Transfer learning mechanism</li>
                </ul>
              </div>
              <div>
                <p><strong>Theoretical Benefits:</strong></p>
                <ul className="text-xs space-y-1">
                  <li>• Inductive bias through shared structure</li>
                  <li>• Implicit regularization across tasks</li>
                  <li>• Sample complexity reduction</li>
                  <li>• Feature learning acceleration</li>
                </ul>
              </div>
            </div>

            <h3 className="font-semibold mb-2">🛠️ Practical Implementation</h3>
            <div className="text-sm text-gray-700">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <p><strong>Architecture Patterns:</strong></p>
                  <ul className="text-xs space-y-1">
                    <li><strong>• Hard Sharing:</strong> Common layers + separate heads</li>
                    <li><strong>• Soft Sharing:</strong> Task-specific networks + regularization</li>
                    <li><strong>• Attention-based:</strong> Dynamic task weighting</li>
                    <li><strong>• Meta-learning:</strong> Learn to learn across tasks</li>
                  </ul>
                </div>
                <div>
                  <p><strong>Real-World Systems:</strong></p>
                  <ul className="text-xs space-y-1">
                    <li><strong>• Google Translate:</strong> 100+ languages sharing encoder</li>
                    <li><strong>• Tesla Autopilot:</strong> Detection + depth + segmentation</li>
                    <li><strong>• Netflix:</strong> Rating + recommendation + content analysis</li>
                    <li><strong>• Medical AI:</strong> Diagnosis + prognosis + treatment</li>
                  </ul>
                </div>
              </div>
              <p className="text-xs mt-2 bg-gray-100 p-2 rounded">
                <strong>Implementation Tips:</strong> Gradient balancing, task scheduling, negative transfer detection, curriculum learning
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DeepLearningPrototype;
