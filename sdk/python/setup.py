from setuptools import setup, find_packages

setup(
    name="keyhole-shield",
    version="1.0.0",
    description="Universal Zero-Knowledge Privacy Perimeter and Tool Wrapper for AI Agents on Midnight",
    author="Keyhole Security Team",
    packages=find_packages(),
    install_requires=[
        "requests>=2.28.0",
        "pydantic>=1.10.0"
    ],
    classifiers=[
        "Programming Language :: Python :: 3",
        "License :: OSI Approved :: Apache Software License",
        "Topic :: Security",
        "Topic :: Scientific/Engineering :: Artificial Intelligence"
    ],
    python_requires=">=3.8",
)
