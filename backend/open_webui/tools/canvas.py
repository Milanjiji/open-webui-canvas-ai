import json
import logging
from uuid import uuid4
from fastapi import Request

log = logging.getLogger(__name__)

async def canvas(
    action: str,
    params: dict,
    __event_call__: callable = None,
    __metadata__: dict = None,
) -> str:
    """
    Update the live Canvas whiteboard drawing board to render visual concepts.
    Use this tool to draw shapes, lines, arrows, text, and apply highlights or animations on the canvas when explaining things.

    :param action: The canvas drawing action/command. For V1, only "draw_line" is supported.
    :param params: Parameter dictionary containing shape coordinates. For "draw_line", require x1, y1, x2, y2 numbers.
    :return: A JSON status string indicating success or error of the canvas update.
    """
    log.info(f"Canvas tool invoked. action: {action}, params: {params}")

    if __event_call__ is None:
        # TEMPORARY DEVELOPMENT DEBUG LOG FOR EVENT CALL NOT AVAILABLE
        log.warning("STEP 4 SKIP: event call not available in canvas.py")
        log.warning("WebSocket event caller is not available")
        return json.dumps(
            {"error": "Event call not available. WebSocket connection required for Canvas execution."}
        )

    # V1 validation
    if action != "draw_line":
        log.warning(f"Canvas tool validation SKIP: Unsupported action '{action}'")
        return json.dumps(
            {"error": f"Unsupported action '{action}'. Only 'draw_line' is supported in V1."}
        )

    required_fields = ["x1", "y1", "x2", "y2"]
    missing_fields = [f for f in required_fields if f not in params]
    if missing_fields:
        log.warning(f"Canvas tool validation SKIP: Missing fields {missing_fields}")
        return json.dumps(
            {"error": f"Missing parameters for 'draw_line': {', '.join(missing_fields)}"}
        )

    try:
        # Emit event to the client over WebSocket
        # TEMPORARY DEVELOPMENT DEBUG LOG FOR STEP 4
        log.warning("STEP 4: Emitting websocket event execute:canvas")
        result = await __event_call__(
            {
                "type": "execute:canvas",
                "data": {
                    "id": str(uuid4()),
                    "action": action,
                    "params": params,
                    "session_id": (__metadata__.get("session_id") if __metadata__ else None),
                },
            }
        )
        # TEMPORARY DEVELOPMENT DEBUG LOG FOR STEP 5
        log.warning(f"STEP 5: Websocket emit successful. Callback result: {result}")
        log.info(f"Canvas tool client callback response: {result}")
        return json.dumps(result if result is not None else {"status": "success"})
    except Exception as e:
        log.warning(f"STEP 4/5 SKIP/ERROR: event call raised exception: {e}")
        log.exception("Error executing canvas tool event call")
        return json.dumps({"error": str(e)})
