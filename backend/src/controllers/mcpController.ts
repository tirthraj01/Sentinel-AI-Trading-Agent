import { Request, Response } from "express";
import { alpacaMcpClient } from "../mcp/alpacaMcpClient.js";

export const getMcpTools = async (_req: Request, res: Response): Promise<void> => {
  const tools = await alpacaMcpClient.discoverTools();

  res.status(200).json({
    success: true,
    data: tools,
    meta: {
      timestamp: new Date().toISOString(),
      total: tools.length,
      protocol: "Model Context Protocol (MCP) 2024-11-05",
      provider: "Alpaca Markets MCP Server",
    },
  });
};

export const callMcpTool = async (req: Request, res: Response): Promise<void> => {
  const { name, arguments: args } = req.body;

  if (!name || typeof name !== "string") {
    res.status(400).json({
      success: false,
      error: "Bad Request",
      message: "Tool 'name' is required in request body.",
    });
    return;
  }

  const result = await alpacaMcpClient.invokeTool(name, args || {});

  if (result.isError) {
    res.status(400).json({
      success: false,
      error: "MCP Tool Execution Failure",
      message: result.content[0]?.text || "Tool execution failed",
    });
    return;
  }

  let parsedOutput = result.content[0]?.text;
  try {
    parsedOutput = JSON.parse(result.content[0]?.text || "{}");
  } catch {
    // Keep as string if not JSON
  }

  res.status(200).json({
    success: true,
    data: parsedOutput,
    meta: {
      timestamp: new Date().toISOString(),
      tool: name,
    },
  });
};
